"use server";

import { alertsSchema, type AlertsInput } from "@/lib/forms/alerts";
import { contactSchema, type ContactInput } from "@/lib/forms/contact";
import {
  clientIp,
  rateLimitMessage,
  withinRateLimit,
} from "@/lib/leads/request";
import { saveFailedMessage, type SimpleFormResult } from "@/lib/leads/results";
import { createAdminClient } from "@/lib/supabase/admin";

function fieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const errors: Record<string, string> = {};
  for (const issue of issues) errors[String(issue.path[0])] ??= issue.message;
  return errors;
}

/** Footer alerts. Signing up again after STOP counts as fresh consent. */
export async function subscribeToAlerts(
  input: AlertsInput & { website?: string },
): Promise<SimpleFormResult> {
  if (input.website) return { status: "ok" };

  const parsed = alertsSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "invalid", errors: fieldErrors(parsed.error.issues) };
  }

  if (!(await withinRateLimit("alerts_ip", await clientIp(), 5, "10 minutes"))) {
    return { status: "error", message: rateLimitMessage };
  }

  const { error } = await createAdminClient().from("subscribers").upsert(
    {
      whatsapp: parsed.data.whatsapp,
      list: "scholarship_alerts",
      consent_at: new Date().toISOString(),
      unsubscribed_at: null,
    },
    { onConflict: "whatsapp,list" },
  );

  if (error) {
    console.error("Could not save subscriber:", error.message);
    return { status: "error", message: saveFailedMessage };
  }

  return { status: "ok" };
}

export async function sendContactMessage(
  input: ContactInput & { website?: string },
): Promise<SimpleFormResult> {
  if (input.website) return { status: "ok" };

  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "invalid", errors: fieldErrors(parsed.error.issues) };
  }

  if (!(await withinRateLimit("contact_ip", await clientIp(), 5, "10 minutes"))) {
    return { status: "error", message: rateLimitMessage };
  }

  const { full_name, whatsapp, email, topic, message } = parsed.data;
  const { error } = await createAdminClient().from("messages").insert({
    full_name,
    whatsapp,
    email: email ?? null,
    topic,
    body: message,
    consent_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Could not save message:", error.message);
    return { status: "error", message: saveFailedMessage };
  }

  return { status: "ok" };
}
