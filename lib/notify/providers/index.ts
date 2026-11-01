import type { EmailProvider, NotifyEnv, SmsProvider } from "../types.ts";
import { inbucketEmail } from "./inbucket.ts";
import { ismartSms } from "./ismart.ts";
import { logEmail, logSms } from "./log.ts";
import { resendEmail } from "./resend.ts";

// No default on purpose. If SMS_PROVIDER fell back to "log" on a live server, rows
// would be marked sent while nobody received anything. supabase/config.toml sets
// the local values.

export function selectSmsProvider(env: NotifyEnv): SmsProvider {
  switch (env.SMS_PROVIDER) {
    case "log":
      return logSms;
    case "ismart":
      return ismartSms(env);
    default:
      throw new Error(`Unknown SMS_PROVIDER: ${env.SMS_PROVIDER ?? "(not set)"}`);
  }
}

export function selectEmailProvider(env: NotifyEnv): EmailProvider {
  switch (env.EMAIL_PROVIDER) {
    case "log":
      return logEmail;
    case "inbucket":
      return inbucketEmail(env);
    case "resend":
      return resendEmail(env);
    default:
      throw new Error(
        `Unknown EMAIL_PROVIDER: ${env.EMAIL_PROVIDER ?? "(not set)"}`,
      );
  }
}
