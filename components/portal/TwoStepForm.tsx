"use client";

import { useActionState, useEffect, useState } from "react";
import {
  beginTotpEnrolment,
  verifyTotp,
  type AuthState,
  type EnrolmentResult,
} from "@/app/(portal)/portal/auth-actions";
import { Button, Field, Skeleton } from "@/components/ui";

const nothing: AuthState = {};

function CodeForm({ factorId, label }: { factorId: string; label: string }) {
  const [state, action, pending] = useActionState(verifyTotp, nothing);

  return (
    <form action={action} className="flex flex-col gap-space-3">
      <input type="hidden" name="factor_id" value={factorId} />
      <Field
        label={label}
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={7}
        required
        autoFocus
        error={state.error}
      />
      <Button type="submit" block loading={pending} loadingText="Checking…">
        Continue
      </Button>
    </form>
  );
}

export function TwoStepVerify({ factorId }: { factorId: string }) {
  return <CodeForm factorId={factorId} label="6-digit code" />;
}

export function TwoStepEnrol() {
  const [enrolment, setEnrolment] = useState<EnrolmentResult | null>(null);

  useEffect(() => {
    beginTotpEnrolment()
      .then(setEnrolment)
      .catch(() =>
        setEnrolment({ error: "Something went wrong. Reload the page to try again." }),
      );
  }, []);

  if (!enrolment) return <Skeleton className="h-64 w-full" />;

  if ("error" in enrolment) {
    return (
      <p role="alert" className="font-bold text-red-text">
        {enrolment.error}
      </p>
    );
  }

  return (
    <>
      <ol className="list-decimal pl-5">
        <li>Open an authenticator app, such as Google Authenticator or Authy.</li>
        <li>Scan this code, or type the setup key.</li>
        <li>Enter the 6-digit code it shows.</li>
      </ol>
      {/* A data URI from Supabase, so next/image has nothing to optimise. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={enrolment.qrCode}
        alt="QR code for your authenticator app"
        width={200}
        height={200}
        className="self-center bg-surface"
      />
      <div className="flex flex-col gap-1">
        <span className="text-label">Setup key</span>
        <code data-testid="totp-secret" className="break-all rounded-sm bg-blue-tint p-space-2">
          {enrolment.secret}
        </code>
      </div>
      <CodeForm factorId={enrolment.factorId} label="6-digit code" />
    </>
  );
}
