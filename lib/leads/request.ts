import "server-only";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

/** Vercel sets x-forwarded-for itself, so visitors cannot spoof the first entry. */
export async function clientIp() {
  const store = await headers();
  return store.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function refererUrl() {
  return (await headers()).get("referer");
}

/** True if this request is within the limit. Fails open: a form always works. */
export async function withinRateLimit(
  scope: string,
  key: string,
  limit: number,
  windowText: string,
) {
  const { data, error } = await createAdminClient().rpc("check_rate_limit", {
    p_scope: scope,
    p_key: key,
    p_limit: limit,
    p_window: windowText,
  });

  if (error) {
    console.error("Rate limit check failed:", error.message);
    return true;
  }

  return data;
}

export const rateLimitMessage =
  "You’ve sent a few forms in a short time. Please wait a few minutes and try again, or message us on WhatsApp.";
