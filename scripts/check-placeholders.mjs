// Runs before every `npm run build`. A public setting or price that still holds
// a [PLACEHOLDER] value must never reach production, so a production deploy
// (VERCEL_ENV=production, or --strict) fails here and lists them. Local and
// staging builds use the seed, which holds placeholders on purpose: they warn.

import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const marker = "[PLACEHOLDER";

function report(strict, heading, lines) {
  const print = strict ? console.error : console.warn;
  print(`Placeholder check: ${heading}`);
  for (const line of lines) print(`  - ${line}`);
  if (strict) process.exitCode = 1;
}

async function findPlaceholders(url, key) {
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const [settings, prices] = await Promise.all([
    supabase.from("settings_public").select("key, value"),
    supabase.from("prices_public").select("key, label, time_text"),
  ]);

  const failure = settings.error ?? prices.error;
  if (failure) throw new Error(failure.message);

  return [
    ...settings.data
      .filter((row) => JSON.stringify(row.value).includes(marker))
      .map((row) => `setting: ${row.key}`),
    ...prices.data
      .filter((row) => JSON.stringify(row).includes(marker))
      .map((row) => `price: ${row.key}`),
  ];
}

nextEnv.loadEnvConfig(process.cwd());

const strict =
  process.argv.includes("--strict") || process.env.VERCEL_ENV === "production";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  report(strict, "could not run.", [
    "NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set",
  ]);
} else {
  try {
    const found = await findPlaceholders(url, key);
    if (found.length > 0) {
      report(strict, "public values still waiting on ELC:", found);
    }
  } catch (error) {
    report(strict, "could not read the database.", [error.message]);
  }
}
