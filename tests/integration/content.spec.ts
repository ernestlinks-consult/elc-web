import { expect, test } from "@playwright/test";
import { database } from "../e2e/leads";

// Public pages are static, so emptying a table only shows through a real
// revalidation: this is also the proof that publishing reaches the site.

const secret = process.env.REVALIDATE_SECRET!;

const allTags = [
  "drives", "testimonials", "programmes", "openings", "trips", "videos", "posts",
  "scholarships", "faqs", "prices",
];

async function revalidate(tags: string[]) {
  const response = await fetch("http://localhost:3000/api/revalidate", {
    method: "POST",
    headers: { "x-revalidate-secret": secret, "Content-Type": "application/json" },
    body: JSON.stringify({ tags }),
  });
  expect(response.status).toBe(200);
}

/** Next regenerates in the background, so look until the new page arrives. */
async function expectSoon(check: () => Promise<boolean>) {
  await expect.poll(check, { timeout: 30_000, intervals: [500, 1000, 2000] }).toBe(true);
}

const html = async (path: string) =>
  (await fetch(`http://localhost:3000${path}`)).text();

test("the revalidate route refuses a bad secret and unknown tags", async () => {
  const bad = await fetch("http://localhost:3000/api/revalidate", {
    method: "POST",
    headers: { "x-revalidate-secret": "wrong" },
    body: "{}",
  });
  expect(bad.status).toBe(401);

  const unknown = await fetch("http://localhost:3000/api/revalidate", {
    method: "POST",
    headers: { "x-revalidate-secret": secret },
    body: JSON.stringify({ tags: ["nonsense"] }),
  });
  expect(unknown.status).toBe(400);
});

test("sections disappear when their tables are empty, and come back", async ({ page }) => {
  test.setTimeout(150_000);

  const contentTables = [
    "drives", "testimonials", "programmes", "openings", "trips", "videos", "posts",
    "scholarships", "faqs",
  ] as const;

  const hide = (state: "draft" | "published") =>
    Promise.all(
      contentTables.map((table) =>
        database
          .from(table)
          .update({ publish_state: state } as never)
          .eq("publish_state", state === "draft" ? "published" : "draft"),
      ),
    );

  const pricesPublic = (value: boolean) =>
    database
      .from("prices")
      .update({ is_public: value })
      .in("key", ["passport_standard", "passport_express"]);

  // Drafts created by this suite's seed are none, so restoring is exact.
  const { count: drafts } = await database
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("publish_state", "draft");
  expect(drafts).toBe(0);

  try {
    await hide("draft");
    await pricesPublic(false);
    await revalidate(allTags);

    await expectSoon(async () => !(await html("/")).includes("Trusted by KNUST"));

    await page.goto("/");
    const main = page.getByRole("main");
    await expect(main.getByText("Trusted by KNUST colleges and associations.")).toHaveCount(0);
    await expect(main.getByText("Learn before you spend.")).toHaveCount(0);
    await expect(main.getByText("Your passport, without the queue stress.")).toHaveCount(0);
    await expect(main.getByText("Standard passport")).toHaveCount(0);
    await expect(page.getByTestId("testimonials")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await expectSoon(async () => !(await html("/services/school-applications")).includes('id="programmes"'));
    await expectSoon(async () => !(await html("/services/travel")).includes('id="trips"'));
    await expectSoon(async () => !(await html("/services/passports")).includes('id="packages"'));

    await page.goto("/services/work-abroad");
    await expect(page.locator("#open-now")).toContainText("Nothing for your field yet?");
    await expect(page.locator("#open-now")).not.toContainText("Hospitality roles");
  } finally {
    await hide("published");
    await pricesPublic(true);
    await revalidate(allTags);
  }

  await expectSoon(async () => (await html("/")).includes("Trusted by KNUST"));
});

test("a changed price reaches the page after revalidation", async () => {
  test.setTimeout(60_000);

  await database.from("prices").update({ amount_ghs: 650 }).eq("key", "passport_standard");

  try {
    await revalidate(["prices"]);
    await expectSoon(async () => (await html("/")).includes("GH¢650"));
  } finally {
    await database.from("prices").update({ amount_ghs: 600 }).eq("key", "passport_standard");
    await revalidate(["prices"]);
  }

  await expectSoon(async () => (await html("/")).includes("GH¢600"));
});
