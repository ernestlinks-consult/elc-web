import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/database.types";
import { blogPageSize } from "./content/taxonomy";
import type { DatabaseCheck } from "./public-routes";

// The route questions only the database can answer, asked before a page streams.
// The fetch is uncached on purpose: an unpublished post must 404 straight away.

function client() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    },
  );
}

export async function passesDatabaseCheck(check: DatabaseCheck) {
  const supabase = client();

  if (check.kind === "post") {
    const { data } = await supabase
      .from("posts")
      .select("id")
      .eq("slug", check.slug)
      .eq("publish_state", "published")
      .maybeSingle();

    return Boolean(data);
  }

  let query = supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("publish_state", "published");

  if (check.topic !== "all") {
    query = query.eq("category", check.topic as Database["public"]["Enums"]["post_category"]);
  }

  const { count } = await query;
  return check.page <= Math.ceil((count ?? 0) / blogPageSize);
}
