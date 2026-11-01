import "server-only";
import { normalizePhone } from "@/lib/forms/phone";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Takes a number off every alerts list. Returns false if it was not subscribed.
 * TODO(alerts): called by the STOP webhook, described in
 * supabase/migrations/20261103090300_subscribers_active.sql.
 */
export async function unsubscribe(whatsapp: string) {
  const number = normalizePhone(whatsapp);
  if (!number) return false;

  const { data, error } = await createAdminClient().rpc("unsubscribe", {
    p_whatsapp: number,
  });

  if (error) throw new Error(`Could not unsubscribe: ${error.message}`);
  return data;
}
