import { Resend } from "resend";
import {
  notSent,
  sent,
  type EmailProvider,
  type NotifyEnv,
} from "../types.ts";

export function resendEmail(env: NotifyEnv): EmailProvider {
  const apiKey = env.RESEND_API_KEY;
  const from = env.EMAIL_FROM;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set.");
  if (!from) throw new Error("EMAIL_FROM is not set.");

  const client = new Resend(apiKey);

  return {
    name: "resend",
    async send({ to, subject, html, text }) {
      const { data, error } = await client.emails.send({
        from,
        to,
        subject,
        html,
        text,
      });

      return error ? notSent(error.message) : sent(data?.id ?? null);
    },
  };
}
