import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { cacheTags } from "@/lib/content/cache";
import { clientIp, withinRateLimit } from "@/lib/leads/request";

// Refreshes public pages when content changes. The portal's content editors
// (phase 2) and the nightly scholarship job will call this.

const knownTags = new Set<string>(Object.values(cacheTags));

function authorised(request: NextRequest) {
  const given = Buffer.from(request.headers.get("x-revalidate-secret") ?? "");
  const expected = Buffer.from(process.env.REVALIDATE_SECRET ?? "");

  return (
    expected.length > 0 &&
    given.length === expected.length &&
    timingSafeEqual(given, expected)
  );
}

export async function POST(request: NextRequest) {
  if (!(await withinRateLimit("revalidate", await clientIp(), 60, "10 minutes"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  if (!authorised(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    tags?: unknown;
  } | null;
  const tags = Array.isArray(body?.tags) ? body.tags : [];

  if (tags.length === 0 || !tags.every((tag) => knownTags.has(tag))) {
    return NextResponse.json({ error: "Unknown tags" }, { status: 400 });
  }

  // Expire now: staff expect to see a change on the next visit.
  for (const tag of tags as string[]) revalidateTag(tag, { expire: 0 });

  return NextResponse.json({ revalidated: tags });
}
