"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  decideAccess,
  safeNext,
  signInPath,
  type AccessRow,
} from "@/lib/auth/access";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error?: string;
  notice?: string;
};

// Identical whether or not the account exists, so nobody can test for an email.
const signInFailed = "That email and password didn't work. Try again, or use a sign-in link.";
const linkSent = "If that email belongs to a staff account, a sign-in link is on its way.";
const somethingWentWrong = "Something went wrong. Check your connection and try again.";

const emailSchema = z.email();

export async function signIn(
  _previous: AuthState,
  data: FormData,
): Promise<AuthState> {
  const email = emailSchema.safeParse(data.get("email"));
  const password = String(data.get("password") ?? "");
  if (!email.success || !password) return { error: signInFailed };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.data,
    password,
  });

  if (error) return { error: signInFailed };

  // A redirect from an action renders the target directly, without passing through
  // proxy.ts, so anyone who can't go straight in has to be sent the right way here.
  const { data: row } = await supabase.rpc("my_staff_access").maybeSingle();
  const state = decideAccess(row as AccessRow);

  if (state === "disabled") {
    await supabase.auth.signOut();
    redirect(`${signInPath}?blocked=1`);
  }
  if (state === "no_access") redirect("/portal/no-access");
  if (state === "two_step") redirect("/portal/two-step");

  redirect(safeNext(data.get("next")));
}

export async function sendSignInLink(
  _previous: AuthState,
  data: FormData,
): Promise<AuthState> {
  const email = emailSchema.safeParse(data.get("email"));
  if (!email.success) return { error: "Enter your work email." };

  const supabase = await createClient();
  await supabase.auth.signInWithOtp({
    email: email.data,
    options: { shouldCreateUser: false },
  });

  return { notice: linkSent };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(signInPath);
}

export type EnrolmentResult =
  | { factorId: string; qrCode: string; secret: string }
  | { error: string };

/** Starts TOTP set-up. An abandoned attempt is cleared first. */
export async function beginTotpEnrolment(): Promise<EnrolmentResult> {
  const supabase = await createClient();
  const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
  if (listError) return { error: somethingWentWrong };

  if (factors.totp.length > 0) return { error: "Two-step sign-in is already set up." };

  for (const factor of factors.all.filter((item) => item.status !== "verified")) {
    await supabase.auth.mfa.unenroll({ factorId: factor.id });
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "ELC staff portal",
    issuer: "ELC staff portal",
  });
  if (error) return { error: somethingWentWrong };

  return {
    factorId: data.id,
    qrCode: data.totp.qr_code,
    secret: data.totp.secret,
  };
}

export async function verifyTotp(
  _previous: AuthState,
  data: FormData,
): Promise<AuthState> {
  const factorId = String(data.get("factor_id") ?? "");
  const code = String(data.get("code") ?? "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return { error: "Enter the 6-digit code." };

  const supabase = await createClient();
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });

  if (error) {
    return { error: "That code didn't work. Check your app and try the new code." };
  }

  redirect("/portal");
}

const passwordSchema = z.string().min(12);

export async function setPassword(
  _previous: AuthState,
  data: FormData,
): Promise<AuthState> {
  const password = passwordSchema.safeParse(data.get("password"));
  if (!password.success) return { error: "Use at least 12 characters." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: password.data });
  if (error) return { error: "Choose a different password." };

  redirect("/portal");
}
