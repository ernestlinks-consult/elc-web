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
  type FinishLaterResult,
  type StepPayload,
  type StepResult,
  type StepValues,
} from "@/lib/leads/results";
import {
  getLeadSession,
  setLeadSession,
  type LeadSession,
} from "@/lib/leads/session";
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

function fieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const errors: Record<string, string> = {};
  for (const issue of issues) errors[String(issue.path[0])] ??= issue.message;
  return errors;
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
): Promise<LeadSession> {
  const current = await getLeadSession();
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
      p_session_lead: current?.leadId,
      p_session_submission: current?.submission,
    })
    .single();

  if (error) throw new Error(error.message);
  return { leadId: data.lead_id, submission: data.submission };
}

async function saveAnswers(
  session: LeadSession,
  form: ServiceForm,
  stepIndex: number,
  answers: StepValues,
  attribution: Attribution,
) {
  const { data, error } = await createAdminClient()
    .rpc("save_lead_step", {
      p_lead_id: session.leadId,
      p_submission: session.submission,
      p_step_index: stepIndex,
      p_step_key: form.steps[stepIndex].key,
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
  return data;
}

const noSessionMessage =
  "We couldn’t find your saved details. Go back to step 1 and save it again.";

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
    return {
      status: "invalid",
      errors: fieldErrors(parsed.error.issues),
      values,
    };
  }

  const answers = parsed.data as StepValues;
  const attribution = await withRefererFallback(payload.attribution);

  try {
    let session: LeadSession | null;

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

      session = await startLead(form, answers, attribution);
      await setLeadSession(session);
    } else {
      session = await getLeadSession();
      if (!session) {
        return { status: "error", message: noSessionMessage, values };
      }
    }

    const saved = await saveAnswers(
      session,
      form,
      stepIndex,
      answers,
      attribution,
    );

    await recordEvent("step_saved", session.leadId, sessionId, {
      service,
      step: stepIndex,
    });

    const completed = !saved.is_partial && stepIndex === form.steps.length - 1;
    if (completed) {
      await recordEvent("form_completed", session.leadId, sessionId, { service });
    }

    if (!completed && !withThankYou) return { status: "saved" };

    const thankYou = await getThankYouDetails(session.leadId);
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

const hasAnswer = (value: unknown) =>
  Array.isArray(value)
    ? value.length > 0
    : value !== undefined && value !== false;

/**
 * "Finish later, just contact me" (F-04). Saves whatever is filled in on this
 * step: required fields may be empty, but filled ones must still be valid.
 */
export async function finishLater(
  payload: Omit<StepPayload, "website">,
): Promise<FinishLaterResult> {
  const { service, stepIndex, values } = payload;
  const form = isServiceKey(service) ? serviceForms[service] : null;
  const step = form?.steps[stepIndex];
  if (!form || !step) return { status: "error", message: saveFailedMessage };

  const parsed = step.laterSchema.safeParse(values);
  if (!parsed.success) {
    return { status: "invalid", errors: fieldErrors(parsed.error.issues) };
  }

  try {
    const session = await getLeadSession();
    if (!session) return { status: "error", message: noSessionMessage };

    const answers = parsed.data as StepValues;
    if (Object.values(answers).some(hasAnswer)) {
      await saveAnswers(
        session,
        form,
        stepIndex,
        answers,
        await withRefererFallback(payload.attribution),
      );
    }

    const { data, error } = await createAdminClient()
      .from("leads")
      .update({ is_partial: true })
      .eq("id", session.leadId)
      .select("ref")
      .single();

    if (error) throw new Error(error.message);
    return { status: "finished", ref: data.ref };
  } catch (error) {
    console.error("Could not finish later:", error);
    return { status: "error", message: saveFailedMessage };
  }
}

export async function recordFormOpen(service: string, sessionId: string) {
  if (!isServiceKey(service)) return;
  if (!(await withinRateLimit("event", await clientIp(), 60, "10 minutes"))) {
    return;
  }

  await recordEvent("form_open", null, sessionId, { service });
}
