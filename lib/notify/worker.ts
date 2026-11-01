import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../supabase/database.types.ts";
import { retryDelayMinutes } from "./backoff.ts";
import {
  renderMessageReceived,
  renderOwnerNewLead,
  renderOwnerSmsFailed,
} from "./templates/email.ts";
import { renderLeadAck } from "./templates/sms.ts";
import type { EmailProvider, SendResult, SmsProvider } from "./types.ts";

type Notification = Database["public"]["Tables"]["notifications"]["Row"];
type Payload = Record<string, string | null | undefined>;

export type OutboxDeps = {
  db: SupabaseClient<Database>;
  sms: SmsProvider;
  email: EmailProvider;
  siteUrl: string;
};

export type OutboxResult = {
  claimed: number;
  sent: number;
  failed: number;
};

const batchSize = 20;

async function loadLead({ db }: OutboxDeps, leadId: string) {
  const { data, error } = await db
    .from("leads")
    .select("*, services (name)")
    .eq("id", leadId)
    .single();

  if (error) throw new Error(`Could not load lead: ${error.message}`);
  return data;
}

async function loadReplyPromise({ db }: OutboxDeps) {
  const { data } = await db
    .from("settings_public")
    .select("value")
    .eq("key", "reply_promise")
    .maybeSingle();

  return typeof data?.value === "string" ? data.value : null;
}

/** The first-submission answers: later ones may not be from the same person. */
async function loadStartAnswers({ db }: OutboxDeps, leadId: string) {
  const { data } = await db
    .from("lead_steps")
    .select("answers")
    .eq("lead_id", leadId)
    .eq("step_index", 0)
    .eq("version", 1)
    .maybeSingle();

  return (data?.answers ?? {}) as Record<string, unknown>;
}

async function loadSmsProblem({ db }: OutboxDeps, leadId: string) {
  const { data } = await db
    .from("notifications")
    .select("status, attempts")
    .eq("lead_id", leadId)
    .eq("template", "sms.lead_ack")
    .maybeSingle();

  if (data?.status === "failed") {
    return "We could not send this person their acknowledgement SMS. Please message them directly.";
  }

  return data && data.status !== "sent" && data.attempts > 0
    ? "Their acknowledgement SMS has not gone through yet. We are still trying."
    : null;
}

async function sendRow(row: Notification, deps: OutboxDeps): Promise<SendResult> {
  const payload = row.payload as Payload;

  switch (row.template) {
    case "sms.lead_ack":
      return deps.sms.send({
        to: row.to_address,
        text: renderLeadAck({
          firstName: payload.first_name,
          ref: String(payload.ref),
          ownerFirstName: payload.owner_first_name,
          replyPromise: await loadReplyPromise(deps),
        }),
      });

    case "email.owner_new_lead": {
      const lead = await loadLead(deps, row.lead_id!);
      return deps.email.send({
        to: row.to_address,
        ...renderOwnerNewLead({
          id: lead.id,
          ref: lead.ref,
          serviceName: lead.services?.name ?? lead.service_key,
          fullName: lead.full_name,
          whatsapp: lead.whatsapp,
          bestTime: lead.best_time,
          ownerFirstName: payload.owner_first_name,
          answers: await loadStartAnswers(deps, lead.id),
          attribution: {
            sourcePage: lead.source_page,
            referrer: lead.referrer,
            utmSource: lead.utm_source,
            utmMedium: lead.utm_medium,
            utmCampaign: lead.utm_campaign,
            heardFrom: lead.heard_from,
          },
          smsProblem: await loadSmsProblem(deps, lead.id),
          siteUrl: deps.siteUrl,
        }),
      });
    }

    case "email.owner_sms_failed": {
      const lead = await loadLead(deps, row.lead_id!);
      return deps.email.send({
        to: row.to_address,
        ...renderOwnerSmsFailed({
          id: lead.id,
          ref: lead.ref,
          fullName: lead.full_name,
          whatsapp: lead.whatsapp,
          siteUrl: deps.siteUrl,
        }),
      });
    }

    case "email.message_received":
      return deps.email.send({
        to: row.to_address,
        ...renderMessageReceived({
          fullName: String(payload.full_name),
          whatsapp: String(payload.whatsapp),
          email: payload.email,
          topic: payload.topic,
          body: String(payload.body),
        }),
      });

    default:
      throw new Error(`Unknown template: ${row.template}`);
  }
}

/** Claims due rows and sends each once. The only code that calls a provider. */
export async function processOutbox(deps: OutboxDeps): Promise<OutboxResult> {
  const { data, error } = await deps.db.rpc("claim_notifications", {
    p_limit: batchSize,
  });
  if (error) throw new Error(`Could not claim notifications: ${error.message}`);

  // SMS first, so the owner email can say if it failed.
  const rows = [...(data ?? [])].sort((a, b) =>
    a.channel === b.channel ? 0 : a.channel === "sms" ? -1 : 1,
  );
  const result: OutboxResult = { claimed: rows.length, sent: 0, failed: 0 };

  for (const row of rows) {
    let outcome: SendResult;
    try {
      outcome = await sendRow(row, deps);
    } catch (cause) {
      outcome = {
        ok: false,
        providerId: null,
        error: cause instanceof Error ? cause.message : String(cause),
      };
    }

    if (outcome.ok) {
      await deps.db.rpc("record_notification_sent", {
        p_id: row.id,
        p_provider_id: outcome.providerId ?? "",
      });
      result.sent += 1;
    } else {
      await deps.db.rpc("record_notification_failure", {
        p_id: row.id,
        p_error: outcome.error ?? "Unknown error",
        p_retry_minutes: retryDelayMinutes(row.attempts + 1),
      });
      result.failed += 1;
    }
  }

  return result;
}
