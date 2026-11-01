import "server-only";
import { cacheLife } from "next/cache";
import { nextIntakes, notSure } from "@/lib/forms/intakes";

/** Options for fields whose choices depend on today's date. */
export async function getDynamicOptions(): Promise<Record<string, string[]>> {
  "use cache";
  cacheLife("hours");

  return { start_intake: [...nextIntakes(new Date()), notSure] };
}
