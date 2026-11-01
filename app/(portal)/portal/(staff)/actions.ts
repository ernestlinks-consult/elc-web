"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { seesAllLeads } from "@/lib/auth/access";
import { staffFor } from "@/lib/auth/session";
import { leadStatuses } from "@/lib/portal/filters";
import { createClient } from "@/lib/supabase/server";

// Every action re-checks who is asking. RLS still has the last word, and the lead
// triggers write the timeline with the signed-in person as the actor.

export type ActionResult = { ok: true } | { ok: false; message: string };

const notAllowed: ActionResult = {
  ok: false,
  message: "You don't have permission to do that.",
};
const failed: ActionResult = {
  ok: false,
  message: "Couldn't save. Check your connection and try again.",
};
const missing: ActionResult = {
  ok: false,
  message: "That record no longer exists, or isn't yours to change.",
};

const id = z.uuid();

function done(): ActionResult {
  revalidatePath("/portal", "layout");
  return { ok: true };
}

const statusInput = z.object({
  leadId: id,
  status: z.enum(leadStatuses),
  closedReason: z.string().trim().max(500).optional(),
});

export async function changeLeadStatus(
  input: z.input<typeof statusInput>,
): Promise<ActionResult> {
  if (!(await staffFor())) return notAllowed;

  const parsed = statusInput.safeParse(input);
  if (!parsed.success) return failed;

  const { leadId, status, closedReason } = parsed.data;
  if (status === "closed" && !closedReason) {
    return { ok: false, message: "Give a reason for closing this lead." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .update({
      status,
      ...(status === "closed" ? { closed_reason: closedReason } : {}),
    })
    .eq("id", leadId)
    .select("id");

  if (error) return failed;
  return data.length > 0 ? done() : missing;
}

const ownerInput = z.object({ leadId: id, ownerId: id.nullable() });

export async function changeLeadOwner(
  input: z.input<typeof ownerInput>,
): Promise<ActionResult> {
  const staff = await staffFor();
  if (!staff || !seesAllLeads(staff.role)) return notAllowed;

  const parsed = ownerInput.safeParse(input);
  if (!parsed.success) return failed;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .update({ owner_id: parsed.data.ownerId })
    .eq("id", parsed.data.leadId)
    .select("id");

  if (error) return failed;
  return data.length > 0 ? done() : missing;
}

const noteInput = z.object({
  leadId: id,
  text: z.string().trim().min(1).max(2000),
});

export async function addLeadNote(
  input: z.input<typeof noteInput>,
): Promise<ActionResult> {
  const staff = await staffFor();
  if (!staff) return notAllowed;

  const parsed = noteInput.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Write a note first." };

  const supabase = await createClient();
  const { error } = await supabase.from("lead_events").insert({
    lead_id: parsed.data.leadId,
    type: "note",
    actor_id: staff.id,
    data: { text: parsed.data.text },
  });

  return error ? missing : done();
}

export async function resendAcknowledgement(leadId: string): Promise<ActionResult> {
  const staff = await staffFor(["admin", "front_desk"]);
  if (!staff) return notAllowed;
  if (!id.safeParse(leadId).success) return failed;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("resend_lead_ack", {
    p_lead_id: leadId,
  });

  if (error) return failed;
  if (data === "already_queued") {
    return { ok: false, message: "An SMS is already waiting to go out." };
  }
  return done();
}

export async function assignMessage(
  messageId: string,
  ownerId: string | null,
): Promise<ActionResult> {
  if (!(await staffFor(["admin", "front_desk"]))) return notAllowed;
  if (!id.safeParse(messageId).success) return failed;
  if (ownerId !== null && !id.safeParse(ownerId).success) return failed;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .update({ assigned_to: ownerId })
    .eq("id", messageId)
    .select("id");

  if (error) return failed;
  return data.length > 0 ? done() : missing;
}

export async function setMessageHandled(
  messageId: string,
  handled: boolean,
): Promise<ActionResult> {
  if (!(await staffFor(["admin", "front_desk"]))) return notAllowed;
  if (!id.safeParse(messageId).success) return failed;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .update({ status: handled ? "handled" : "new" })
    .eq("id", messageId)
    .select("id");

  if (error) return failed;
  return data.length > 0 ? done() : missing;
}

export async function unsubscribeSubscriber(
  subscriberId: string,
): Promise<ActionResult> {
  if (!(await staffFor(["admin", "front_desk"]))) return notAllowed;
  if (!id.safeParse(subscriberId).success) return failed;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscribers")
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq("id", subscriberId)
    .is("unsubscribed_at", null)
    .select("id");

  if (error) return failed;
  return data.length > 0 ? done() : missing;
}
