// Outbox worker. pg_cron calls this every minute; `npm run notify:run` calls it by
// hand locally. All the logic is in lib/notify, which also runs under Vitest.

import { createClient } from "@supabase/supabase-js";
import {
  selectEmailProvider,
  selectSmsProvider,
} from "../../../lib/notify/providers/index.ts";
import { processOutbox } from "../../../lib/notify/worker.ts";

function secretsMatch(given: string | null, expected: string | undefined) {
  if (!given || !expected) return false;

  const a = new TextEncoder().encode(given);
  const b = new TextEncoder().encode(expected);
  if (a.length !== b.length) return false;

  let difference = 0;
  for (let index = 0; index < a.length; index += 1) {
    difference |= a[index] ^ b[index];
  }
  return difference === 0;
}

Deno.serve(async (request) => {
  const env = Deno.env.toObject();

  if (!secretsMatch(request.headers.get("x-notify-secret"), env.NOTIFY_CRON_SECRET)) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const result = await processOutbox({
      db: createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
      }),
      sms: selectSmsProvider(env),
      email: selectEmailProvider(env),
      siteUrl: env.SITE_URL ?? "",
    });

    return Response.json(result);
  } catch (error) {
    console.error("send-notifications failed:", error);
    return Response.json({ error: "Worker failed" }, { status: 500 });
  }
});
