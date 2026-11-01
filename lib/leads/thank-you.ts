import "server-only";
import { publicValue } from "@/lib/content/placeholder";
import { getSettings } from "@/lib/content/settings";
import { isServiceKey, serviceForms } from "@/lib/forms";
import { createAdminClient } from "@/lib/supabase/admin";

export type ThankYouDetails = {
  ref: string;
  ownerFirstName: string | null;
  replyPromise: string | null;
  nextSteps: string[];
};

export async function getReplyPromise() {
  return publicValue((await getSettings()).reply_promise);
}

/** What the thank-you screen may show about this lead, and nothing more. */
export async function getThankYouDetails(
  leadId: string,
): Promise<ThankYouDetails | null> {
  const { data } = await createAdminClient()
    .from("leads")
    .select("ref, service_key, staff:owner_id (full_name)")
    .eq("id", leadId)
    .maybeSingle();

  if (!data) return null;

  return {
    ref: data.ref,
    ownerFirstName: data.staff?.full_name.split(" ")[0] ?? null,
    replyPromise: await getReplyPromise(),
    nextSteps: isServiceKey(data.service_key)
      ? serviceForms[data.service_key].nextSteps
      : [],
  };
}
