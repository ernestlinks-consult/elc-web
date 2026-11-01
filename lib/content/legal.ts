import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { marked } from "marked";
import { cacheLife } from "next/cache";
import { sanitiseArticle } from "./article";
import { isPlaceholder } from "./placeholder";

export type LegalKey = "privacy" | "terms" | "payments";

/** The page's HTML, or null while ELC's text is still a placeholder. */
export async function getLegalHtml(key: LegalKey) {
  // Part of the deploy, so it can stay cached until the next one.
  "use cache";
  cacheLife("max");

  const source = await readFile(
    join(process.cwd(), "content", "legal", `${key}.md`),
    "utf8",
  );

  return isPlaceholder(source) ? null : sanitiseArticle(await marked.parse(source));
}
