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

export type LeadSession = { leadId: string; submission: number };

export function encodeLeadSession(
  { leadId, submission }: LeadSession,
  expiresAt: number,
) {
  const payload = `${leadId}.${submission}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

/** The session, or null if the value is missing, tampered with or expired. */
export function decodeLeadSession(
  value: string | undefined,
  now = Date.now(),
): LeadSession | null {
  const [leadId, submission, expiresAt, signature, ...extra] =
    value?.split(".") ?? [];
  if (!leadId || !submission || !expiresAt || !signature || extra.length > 0) {
    return null;
  }

  const expected = Buffer.from(sign(`${leadId}.${submission}.${expiresAt}`));
  const received = Buffer.from(signature);
  if (
    expected.length !== received.length ||
    !timingSafeEqual(expected, received)
  ) {
    return null;
  }

  return Number(expiresAt) > now
    ? { leadId, submission: Number(submission) }
    : null;
}

export async function setLeadSession(session: LeadSession) {
  const store = await cookies();

  store.set(
    cookieName,
    encodeLeadSession(session, Date.now() + maxAgeSeconds * 1000),
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
