import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Next caches fetch separately from "use cache", on disk and across builds, and
// revalidateTag would not reach it. Callers cache with "use cache" and cacheTag
// only, so a publish shows up straight away.
const uncachedFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: "no-store" });

// Anon key, no session and no cookies, so it can run inside "use cache". RLS
// limits it to what any visitor may read.
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: uncachedFetch },
    },
  );
}
