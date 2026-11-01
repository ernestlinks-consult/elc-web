import {
  notSent,
  sent,
  type EmailProvider,
  type NotifyEnv,
} from "../types.ts";

/** Local mail viewer (Mailpit, at http://127.0.0.1:44324), through its send API. */
export function inbucketEmail(env: NotifyEnv): EmailProvider {
  const baseUrl = env.INBUCKET_URL;
  if (!baseUrl) throw new Error("INBUCKET_URL is not set.");
  const from = env.EMAIL_FROM ?? "ELC local <noreply@example.test>";

  return {
    name: "inbucket",
    async send({ to, subject, html, text }) {
      const response = await fetch(`${baseUrl}/api/v1/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          From: { Email: from.match(/<(.+)>/)?.[1] ?? from },
          To: [{ Email: to }],
          Subject: subject,
          HTML: html,
          Text: text,
        }),
      });

      if (!response.ok) {
        return notSent(`Mail viewer ${response.status}: ${await response.text()}`);
      }

      const { ID } = (await response.json()) as { ID?: string };
      return sent(ID ?? null);
    },
  };
}
