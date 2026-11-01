import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Who is filling in this form, once step 1 has saved. The lead id lives only in
// this signed, httpOnly cookie, never in a URL.

const cookieName = "elc_lead";
const maxAgeSeconds = 7 * 24 * 60 * 60;

function secret() {
  const value = process.env.LEAD_SESSION_SECRET;
  if (!value) throw new Error("LEAD_SESSION_SECRET is not set.");
  return value;
}

const sign = (payload: string) =>
  createHmac("sha256", secret()).update(payload).digest("base64url");

export function encodeLeadSession(leadId: string, expiresAt: number) {
  const payload = `${leadId}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

/** The lead id, or null if the value is missing, tampered with or expired. */
export function decodeLeadSession(value: string | undefined, now = Date.now()) {
  const [leadId, expiresAt, signature, ...extra] = value?.split(".") ?? [];
  if (!leadId || !expiresAt || !signature || extra.length > 0) return null;

  const expected = Buffer.from(sign(`${leadId}.${expiresAt}`));
  const received = Buffer.from(signature);
  if (
    expected.length !== received.length ||
    !timingSafeEqual(expected, received)
  ) {
    return null;
  }

  return Number(expiresAt) > now ? leadId : null;
}

export async function setLeadSession(leadId: string) {
  const store = await cookies();

  store.set(
    cookieName,
    encodeLeadSession(leadId, Date.now() + maxAgeSeconds * 1000),
    {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: maxAgeSeconds,
    },
  );
}

export async function getLeadSession() {
  const store = await cookies();
  return decodeLeadSession(store.get(cookieName)?.value);
}
