"use server";

import { heardFromKey } from "@/lib/forms/common";
import { isServiceKey, serviceForms } from "@/lib/forms";
import { isInputField, type ServiceForm } from "@/lib/forms/types";
import {
  clientIp,
  rateLimitMessage,
  refererUrl,
  withinRateLimit,
} from "@/lib/leads/request";
import {
  saveFailedMessage,
  type Attribution,
  type StepPayload,
  type StepResult,
  type StepValues,
} from "@/lib/leads/results";
import { getLeadSession, setLeadSession } from "@/lib/leads/session";
import { getThankYouDetails } from "@/lib/leads/thank-you";
import { createAdminClient } from "@/lib/supabase/admin";

const eventPage = "/start";

function valuesFromForm(
  form: ServiceForm,
  stepIndex: number,
  data: FormData,
): StepValues {
  const values: StepValues = {};

  for (const field of form.steps[stepIndex].fields.filter(isInputField)) {
    if (field.kind === "checkboxes") values[field.key] = data.getAll(field.key);
    else if (field.kind === "tick") values[field.key] = data.has(field.key);
    else values[field.key] = data.get(field.key) ?? "";
  }

  return values;
}

function attributionFromForm(data: FormData): Attribution {
  const read = (key: string) => String(data.get(key) ?? "") || undefined;

  return {
    source_page: read("source_page"),
    referrer: read("referrer"),
    utm_source: read("utm_source"),
    utm_medium: read("utm_medium"),
    utm_campaign: read("utm_campaign"),
  };
}

function payloadFromForm(data: FormData): StepPayload | null {
  const service = data.get("service");
  const stepIndex = Number(data.get("step_index"));
  if (!isServiceKey(service) || !serviceForms[service].steps[stepIndex]) {
    return null;
  }

  return {
    service,
    stepIndex,
    values: valuesFromForm(serviceForms[service], stepIndex, data),
    attribution: attributionFromForm(data),
    website: String(data.get("website") ?? ""),
  };
}

/** Without JavaScript the hidden fields stay empty, but the page URL has it all. */
async function withRefererFallback(attribution: Attribution) {
  if (attribution.source_page) return attribution;

  const referer = await refererUrl();
  if (!referer) return attribution;

  const url = new URL(referer);
  return {
    ...attribution,
    source_page: url.pathname,
    utm_source: url.searchParams.get("utm_source") ?? undefined,
    utm_medium: url.searchParams.get("utm_medium") ?? undefined,
    utm_campaign: url.searchParams.get("utm_campaign") ?? undefined,
  };
}

async function recordEvent(
  name: string,
  leadId: string | null,
  sessionId: string | undefined,
  props: Record<string, string | number>,
) {
  const { error } = await createAdminClient().from("events").insert({
    name,
    page: eventPage,
    lead_id: leadId,
    session_id: sessionId ?? null,
    props,
  });

  // Analytics must never cost a visitor their saved form.
  if (error) console.error("Could not record event:", error.message);
}

async function startLead(
  form: ServiceForm,
  values: StepValues,
  attribution: Attribution,
) {
  const { data, error } = await createAdminClient()
    .rpc("create_or_attach_lead", {
      p_service: form.service,
      p_full_name: String(values.full_name),
      p_whatsapp: String(values.whatsapp),
      p_best_time: String(values.best_time),
      p_steps_total: form.steps.length,
      p_form_version: form.version,
      p_source_page: attribution.source_page,
      p_referrer: attribution.referrer,
      p_utm_source: attribution.utm_source,
      p_utm_medium: attribution.utm_medium,
      p_utm_campaign: attribution.utm_campaign,
    })
    .single();

  if (error) throw new Error(error.message);
  return data.lead_id;
}

async function submit(
  payload: StepPayload,
  withThankYou: boolean,
): Promise<StepResult> {
  const { service, stepIndex, values, sessionId } = payload;
  const form = isServiceKey(service) ? serviceForms[service] : null;
  const step = form?.steps[stepIndex];

  if (!form || !step) {
    return { status: "error", message: saveFailedMessage, values };
  }

  // Looks like success, so a bot learns nothing. Nothing is stored.
  if (payload.website) {
    return { status: "finished", ref: null };
  }

  const parsed = step.schema.safeParse(values);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[String(issue.path[0])] ??= issue.message;
    }
    return { status: "invalid", errors, values };
  }

  const answers = parsed.data as StepValues;
  const attribution = await withRefererFallback(payload.attribution);

  try {
    let leadId: string | null;

    if (stepIndex === 0) {
      const ip = await clientIp();
      const allowed =
        (await withinRateLimit("lead_ip", ip, 5, "10 minutes")) &&
        (await withinRateLimit(
          "lead_phone",
          String(answers.whatsapp),
          3,
          "1 hour",
        ));
      if (!allowed) {
        return { status: "error", message: rateLimitMessage, values };
      }

      leadId = await startLead(form, answers, attribution);
      await setLeadSession(leadId);
    } else {
      leadId = await getLeadSession();
      if (!leadId) {
        return {
          status: "error",
          message:
            "We couldn’t find your saved details. Go back to step 1 and save it again.",
          values,
        };
      }
    }

    const { data, error } = await createAdminClient()
      .rpc("save_lead_step", {
        p_lead_id: leadId,
        p_step_index: stepIndex,
        p_step_key: step.key,
        p_answers: answers as never,
        p_heard_from: answers[heardFromKey] as string | undefined,
        p_source_page: attribution.source_page,
        p_referrer: attribution.referrer,
        p_utm_source: attribution.utm_source,
        p_utm_medium: attribution.utm_medium,
        p_utm_campaign: attribution.utm_campaign,
      })
      .single();

    if (error) throw new Error(error.message);

    await recordEvent("step_saved", leadId, sessionId, {
      service,
      step: stepIndex,
    });

    const completed = !data.is_partial && stepIndex === form.steps.length - 1;
    if (completed) {
      await recordEvent("form_completed", leadId, sessionId, { service });
    }

    if (!completed && !withThankYou) return { status: "saved" };

    const thankYou = await getThankYouDetails(leadId);
    return {
      status: "finished",
      ref: thankYou?.ref ?? null,
      thankYou: withThankYou ? thankYou : undefined,
    };
  } catch (error) {
    console.error("Could not save step:", error);
    return { status: "error", message: saveFailedMessage, values };
  }
}

/**
 * With JavaScript the client validates, then sends a payload and moves to the
 * next step. Without it the browser posts FormData here, and the visitor goes
 * straight to the thank-you screen: step 1 alone is a lead (F-02).
 */
export async function submitStep(
  _previous: StepResult,
  input: StepPayload | FormData,
): Promise<StepResult> {
  if (!(input instanceof FormData)) return submit(input, false);

  const payload = payloadFromForm(input);
  if (!payload) {
    return { status: "error", message: saveFailedMessage, values: {} };
  }

  return submit(payload, true);
}

/** "Finish later, just contact me" (F-04). */
export async function finishLater(): Promise<{ ref: string | null }> {
  const leadId = await getLeadSession();
  if (!leadId) return { ref: null };

  const { data } = await createAdminClient()
    .from("leads")
    .update({ is_partial: true })
    .eq("id", leadId)
    .select("ref")
    .maybeSingle();

  return { ref: data?.ref ?? null };
}

export async function recordFormOpen(service: string, sessionId: string) {
  if (!isServiceKey(service)) return;
  if (!(await withinRateLimit("event", await clientIp(), 60, "10 minutes"))) {
    return;
  }

  await recordEvent("form_open", null, sessionId, { service });
}
