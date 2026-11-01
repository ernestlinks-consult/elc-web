import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { cacheTags, contentCacheLife } from "./cache";
import { isPlaceholder } from "./placeholder";

const formatGhs = (amount: number) =>
  `GH¢${amount.toLocaleString("en-GH", { maximumFractionDigits: 2 })}`;

/** prices.key to display amount, public prices only. */
export async function getPriceLabels(): Promise<Record<string, string>> {
  "use cache";
  cacheTag(cacheTags.prices);
  cacheLife(contentCacheLife);

  const { data, error } = await createPublicClient()
    .from("prices_public")
    .select("key, amount_ghs, label");

  if (error) throw new Error(`Could not load prices: ${error.message}`);

  return Object.fromEntries(
    data
      .filter((price) => price.amount_ghs !== null && !isPlaceholder(price.label))
      .map((price) => [price.key, formatGhs(price.amount_ghs!)]),
  );
}
