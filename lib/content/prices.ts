import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { cacheTags, contentCacheLife } from "./cache";
import { isPlaceholder, publicValue } from "./placeholder";

const formatGhs = (amount: number) =>
  `GH¢${amount.toLocaleString("en-GH", { maximumFractionDigits: 2 })}`;

export type PublicPrice = {
  key: string;
  label: string;
  amount: string;
  /** Null while it is a placeholder, so nobody sees it. */
  timeText: string | null;
};

/** Public prices by key. A never_public price cannot appear: the view leaves it out. */
export async function getPrices(): Promise<Record<string, PublicPrice>> {
  "use cache";
  cacheTag(cacheTags.prices);
  cacheLife(contentCacheLife);

  const { data, error } = await createPublicClient()
    .from("prices_public")
    .select("key, label, amount_ghs, time_text");

  if (error) throw new Error(`Could not load prices: ${error.message}`);

  return Object.fromEntries(
    data
      .filter((price) => price.amount_ghs !== null && !isPlaceholder(price.label))
      .map((price) => [
        price.key,
        {
          key: price.key!,
          label: price.label!,
          amount: formatGhs(price.amount_ghs!),
          timeText: publicValue(price.time_text),
        },
      ]),
  );
}

/** prices.key to display amount, for form option labels. */
export async function getPriceLabels(): Promise<Record<string, string>> {
  const prices = await getPrices();

  return Object.fromEntries(
    Object.values(prices).map(({ key, amount }) => [key, amount]),
  );
}
