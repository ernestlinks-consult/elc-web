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
    headers: {
      "x-revalidate-secret": secret,
      "Content-Type": "application/json",
      "x-forwarded-for": `10.0.0.${Math.floor(Math.random() * 250) + 1}`,
    },
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

test("the revalidate route only accepts POST", async () => {
  const response = await fetch("http://localhost:3000/api/revalidate");

  expect(response.status).toBe(405);
});

test("the revalidate route needs a secret", async () => {
  const response = await fetch("http://localhost:3000/api/revalidate", {
    method: "POST",
    body: JSON.stringify({ tags: ["prices"] }),
  });

  expect(response.status).toBe(401);
});

test("guessing the secret is rate limited", async () => {
  const headers = { "x-revalidate-secret": "wrong", "x-forwarded-for": `10.9.9.${Date.now() % 250}` };
  const statuses: number[] = [];

  for (let attempt = 0; attempt < 62; attempt += 1) {
    const response = await fetch("http://localhost:3000/api/revalidate", {
      method: "POST",
      headers,
    });
    statuses.push(response.status);
  }

  expect(statuses.slice(0, 60).every((status) => status === 401)).toBe(true);
  expect(statuses.at(-1)).toBe(429);
});

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

  const hidden = new Map<string, string[]>();

  const hide = () =>
    Promise.all(
      contentTables.map(async (table) => {
        const { data } = await database
          .from(table)
          .update({ publish_state: "draft" } as never)
          .eq("publish_state", "published")
          .select("id");
        hidden.set(table, (data ?? []).map(({ id }) => id));
      }),
    );

  const restore = () =>
    Promise.all(
      contentTables.map((table) =>
        database
          .from(table)
          .update({ publish_state: "published" } as never)
          .in("id", hidden.get(table) ?? []),
      ),
    );

  const pricesPublic = (value: boolean) =>
    database
      .from("prices")
      .update({ is_public: value })
      .in("key", ["passport_standard", "passport_express"]);

  try {
    await hide();
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
    await restore();
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

test("a post published after the build opens, and 404s once pulled", async ({ page }) => {
  const slug = `sample-after-build-${Date.now()}`;
  const author = "00000000-0000-4000-8000-000000000004";
  const { data, error } = await database
    .from("posts")
    .insert({
      slug,
      title: "[Sample] Published after the build",
      summary: "A late post.",
      body_html: "<p>Late post body.</p>",
      category: "travel",
      author_id: author,
      owner_id: author,
      publish_state: "published",
      published_at: new Date().toISOString(),
      reviewed_by: "00000000-0000-4000-8000-000000000002",
    })
    .select("id")
    .single();
  expect(error).toBeNull();

  try {
    await revalidate(["posts"]);

    const response = await page.goto(`/resources/blog/${slug}`);
    expect(response!.status()).toBe(200);
    await expect(page.getByTestId("article-body")).toContainText("Late post body.");

    await database.from("posts").update({ publish_state: "draft" }).eq("id", data!.id);
    await revalidate(["posts"]);

    const pulled = await page.goto(`/resources/blog/${slug}`);
    expect(pulled!.status()).toBe(404);
  } finally {
    await database.from("posts").delete().eq("id", data!.id);
    await revalidate(["posts"]);
  }
});
