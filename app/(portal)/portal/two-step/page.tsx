import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { AuthCard } from "@/components/portal/AuthCard";
import {
  TwoStepEnrol,
  TwoStepVerify,
} from "@/components/portal/TwoStepForm";
import { Skeleton } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Two-step sign-in | ELC staff portal",
  robots: { index: false, follow: false },
};

async function Step() {
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.mfa.listFactors();
  const factor = data?.totp[0];

  return factor ? (
    <>
      <p className="text-ink-muted">
        Enter the code from your authenticator app.
      </p>
      <TwoStepVerify factorId={factor.id} />
    </>
  ) : (
    <>
      <p className="text-ink-muted">
        Admin accounts need a second step. This takes about a minute, once.
      </p>
      <TwoStepEnrol />
    </>
  );
}

export default function Page() {
  return (
    <AuthCard title="Two-step sign-in">
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <Step />
      </Suspense>
    </AuthCard>
  );
}
