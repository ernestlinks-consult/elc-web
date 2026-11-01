// Runs the outbox worker once against the local stack. On a real environment
// pg_cron does this every minute.

import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.NOTIFY_CRON_SECRET;

if (!url || !secret) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and NOTIFY_CRON_SECRET must be set.");
  process.exitCode = 1;
} else {
  const response = await fetch(`${url}/functions/v1/send-notifications`, {
    method: "POST",
    headers: { "x-notify-secret": secret },
  });

  console.log(response.status, await response.text());
  if (!response.ok) process.exitCode = 1;
}
