"use client";

import { useActionState } from "react";
import { setPassword, type AuthState } from "@/app/(portal)/portal/auth-actions";
import { Button, Field } from "@/components/ui";

const nothing: AuthState = {};

export function SetPasswordForm() {
  const [state, action, pending] = useActionState(setPassword, nothing);

  return (
    <form action={action} className="flex flex-col gap-space-3">
      <Field
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        hint="At least 12 characters."
        required
        error={state.error}
      />
      <Button type="submit" block loading={pending} loadingText="Saving…">
        Save password
      </Button>
    </form>
  );
}
