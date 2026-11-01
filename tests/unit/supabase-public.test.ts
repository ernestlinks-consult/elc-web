import { afterEach, expect, test, vi } from "vitest";

const createClient = vi.hoisted(() => vi.fn());

vi.mock("server-only", () => ({}));
vi.mock("@supabase/supabase-js", () => ({ createClient }));

const { createPublicClient } = await import("@/lib/supabase/public");

afterEach(() => {
  vi.unstubAllGlobals();
});

test("never lets Next's fetch cache sit under revalidateTag", async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response("[]"));
  vi.stubGlobal("fetch", fetchMock);

  createPublicClient();
  const { global } = createClient.mock.calls[0][2];
  await global.fetch("http://db.test/rest/v1/settings_public", {
    headers: { apikey: "key" },
  });

  expect(fetchMock).toHaveBeenCalledWith(
    "http://db.test/rest/v1/settings_public",
    { headers: { apikey: "key" }, cache: "no-store" },
  );
});
