import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Service } from "@/lib/site-config";
import { createPublicClient } from "@/lib/supabase/public";
import { cacheTags, contentCacheLife } from "./cache";

export async function getServices(): Promise<Service[]> {
  "use cache";
  cacheTag(cacheTags.services);
  cacheLife(contentCacheLife);

  // Named columns, not *: visitors have no access to owner_id.
  const { data, error } = await createPublicClient()
    .from("services")
    .select("key, name, slug, short_description, whatsapp_keyword")
    .order("sort_order");

  if (error) throw new Error(`Could not load services: ${error.message}`);

  return data.map((service) => ({
    key: service.key,
    name: service.name,
    slug: service.slug,
    shortDescription: service.short_description,
    whatsappKeyword: service.whatsapp_keyword,
  }));
}
