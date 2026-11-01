import { beforeEach, expect, test, vi } from "vitest";

type Call = { table: string; select: string; filters: [string, unknown][] };

const state = vi.hoisted(() => ({
  calls: [] as Call[],
  rows: [] as unknown[],
}));

vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));
vi.mock("@/lib/supabase/public", () => ({
  createPublicClient: () => ({
    from(table: string) {
      const call: Call = { table, select: "", filters: [] };
      state.calls.push(call);

      const chain = {
        select(columns: string) {
          call.select = columns;
          return chain;
        },
        eq(column: string, value: unknown) {
          call.filters.push([column, value]);
          return chain;
        },
        order: () => chain,
        limit: () => chain,
        then: (resolve: (value: unknown) => void) =>
          resolve({ data: state.rows, error: null }),
      };

      return chain;
    },
  }),
}));

const listings = await import("@/lib/content/listings");
const { getPrices } = await import("@/lib/content/prices");

beforeEach(() => {
  state.calls.length = 0;
  state.rows = [];
});

const lastCall = () => state.calls.at(-1)!;

test.each([
  ["drives", () => listings.getDrives()],
  ["testimonials", () => listings.getTestimonials()],
  ["programmes", () => listings.getProgrammes("study")],
  ["openings", () => listings.getOpenings()],
  ["faqs", () => listings.getFaqs("visa")],
  ["trips", () => listings.getTrips()],
  ["videos", () => listings.getVideos("home")],
  ["posts", () => listings.getLatestPosts(3)],
])("%s reads only published rows, and names its columns", async (table, read) => {
  await read();

  expect(lastCall().table).toBe(table);
  expect(lastCall().filters).toContainEqual(["publish_state", "published"]);
  expect(lastCall().select).not.toContain("*");
});

test("programmes never ask for the school name", async () => {
  await listings.getProgrammes("study");

  expect(lastCall().select).not.toContain("internal_school_name");
});

test("testimonials need permission on file", async () => {
  await listings.getTestimonials();

  expect(lastCall().filters).toContainEqual(["permission_on_file", true]);
});

test("scholarships read the view, which applies the publishing rules", async () => {
  await listings.getScholarships();

  expect(lastCall().table).toBe("scholarships_public");
});

test("videos are filtered to the page they're placed on", async () => {
  await listings.getVideos("school");

  expect(lastCall().filters).toContainEqual(["video_placements.page_key", "school"]);
});

test("prices read the public view, and hide a placeholder time", async () => {
  state.rows = [
    { key: "a", label: "A", amount_ghs: 1800, time_text: "[PLACEHOLDER: x]" },
    { key: "b", label: "B", amount_ghs: 600, time_text: "About 1 month" },
    { key: "c", label: "C", amount_ghs: null, time_text: null },
  ];

  const prices = await getPrices();

  expect(lastCall().table).toBe("prices_public");
  expect(prices.a).toMatchObject({ amount: "GH¢1,800", timeText: null });
  expect(prices.b.timeText).toBe("About 1 month");
  expect(prices).not.toHaveProperty("c");
});
