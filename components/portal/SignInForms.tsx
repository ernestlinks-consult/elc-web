"use client";

import { useActionState } from "react";
import {
  sendSignInLink,
  signIn,
  type AuthState,
} from "@/app/(portal)/portal/auth-actions";
import { Button, Field } from "@/components/ui";

const nothing: AuthState = {};

export function SignInForms({ next }: { next?: string }) {
  const [state, signInAction, signingIn] = useActionState(signIn, nothing);
  const [link, linkAction, sending] = useActionState(sendSignInLink, nothing);

  return (
    <>
      <form action={signInAction} className="flex flex-col gap-space-3">
        <input type="hidden" name="next" value={next ?? ""} />
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="username"
          required
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        {state.error && (
          <p role="alert" className="font-bold text-red-text">
            {state.error}
          </p>
        )}
        <Button type="submit" block loading={signingIn} loadingText="Signing in…">
          Sign in
        </Button>
      </form>

      <form
        action={linkAction}
        aria-label="Sign in with an email link"
        className="flex flex-col gap-space-3 border-t border-line pt-space-4"
      >
        <Field
          label="Email for a sign-in link"
          name="email"
          type="email"
          autoComplete="username"
        />
        {link.error && (
          <p role="alert" className="font-bold text-red-text">
            {link.error}
          </p>
        )}
        {link.notice && (
          <p role="status" className="rounded-md bg-success-tint p-space-3 text-success">
            {link.notice}
          </p>
        )}
        <Button
          type="submit"
          variant="secondary"
          block
          loading={sending}
          loadingText="Sending…"
        >
          Email me a sign-in link
        </Button>
      </form>
    </>
  );
}
