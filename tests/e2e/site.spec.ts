import { expect, test } from "@playwright/test";
import { database } from "./leads";
import { createLead, emailOf, ids, signInAndWait } from "./portal-helpers";
import {
  desktop,
  expectNoAxeViolations,
  expectNoHorizontalOverflow,
  phone,
} from "./shell";

const pages = [
  { path: "/", service: null },
  { path: "/services/passports", service: "passport" },
  { path: "/services/school-applications", service: "school" },
  { path: "/services/visa-applications", service: "visa" },
  { path: "/services/work-abroad", service: "work" },
  { path: "/services/exams", service: "exams" },
  { path: "/services/travel", service: "travel" },
];

const paths = pages.map(({ path }) => path);

test.describe("every page", () => {
  for (const { path, service } of pages) {
    test(`${path} responds with one H1`, async ({ page }) => {
      const response = await page.goto(path);

      expect(response!.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    });

    test(`${path} has a canonical URL and share image`, async ({ page }) => {
      await page.goto(path);

      const canonical = await page.locator("link[rel=canonical]").getAttribute("href");
      expect(canonical).toMatch(/^https:\/\//);
      expect(new URL(canonical!).pathname).toBe(path);
      await expect(page.locator("meta[property='og:image']")).toHaveAttribute(
        "content",
        /og-default\.png/,
      );
      await expect(page.locator("meta[name='twitter:card']")).toHaveAttribute(
        "content",
        "summary_large_image",
      );
    });

    test(`${path} links to /start for the right service`, async ({ page }) => {
      await page.goto(path);

      const hrefs = await page
        .getByRole("main")
        .locator("a[href^='/start']")
        .evaluateAll((links) => links.map((link) => link.getAttribute("href")));

      expect(hrefs.length).toBeGreaterThan(0);
      if (service) expect(hrefs).toContain(`/start?service=${service}`);
    });
  }

  test("every page has its own title and description", async ({ page }) => {
    const seen = { titles: new Set<string>(), descriptions: new Set<string>() };

    for (const path of paths) {
      await page.goto(path);
      seen.titles.add(await page.title());
      seen.descriptions.add(
        (await page.locator("meta[name=description]").getAttribute("content"))!,
      );
    }

    expect(seen.titles.size).toBe(paths.length);
    expect(seen.descriptions.size).toBe(paths.length);
  });

  test("/start links are full page loads, so the right form opens", async ({ page }) => {
    await page.goto("/services/visa-applications");
    await page.evaluate(() => {
      (window as unknown as { marker: boolean }).marker = true;
    });

    await page.getByRole("main").getByRole("link", { name: "Start online" }).first().click();
    await page.waitForURL("**/start?service=visa");

    expect(
      await page.evaluate(() => (window as unknown as { marker?: boolean }).marker),
    ).toBeUndefined();
    await expect(
      page.getByRole("navigation", { name: "Choose a service" }).locator("[aria-current=page]"),
    ).toHaveText("Visa");
  });
});

test.describe("real 404s", () => {
  for (const path of [
    "/no-such-page",
    "/services/no-such-service",
    "/services/birth-certificates",
    "/start/no-such-service",
  ]) {
    test(`${path} is a 404`, async ({ page }) => {
      const response = await page.goto(path);

      expect(response!.status()).toBe(404);
      await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
      await expect(page.getByRole("banner")).toBeVisible();
    });
  }

  test("another person's lead is a 404", async ({ page }) => {
    const other = await createLead({ ownerId: ids.peace });
    await signInAndWait(page, emailOf.grace);

    const response = await page.goto(`/portal/leads/${other.id}`);

    expect(response!.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Not found" })).toBeVisible();
    await expect(page.getByRole("main")).not.toContainText(other.name);
  });

  test("a made-up lead id is a 404", async ({ page }) => {
    await signInAndWait(page, emailOf.frontDesk);

    expect((await page.goto("/portal/leads/not-a-real-id"))!.status()).toBe(404);
    expect(
      (await page.goto("/portal/leads/11111111-1111-4111-8111-111111111111"))!.status(),
    ).toBe(404);
  });

  test("your own lead still opens", async ({ page }) => {
    const own = await createLead({ ownerId: ids.grace });
    await signInAndWait(page, emailOf.grace);

    expect((await page.goto(`/portal/leads/${own.id}`))!.status()).toBe(200);
  });
});

test.describe("house rules", () => {
  test("no school name reaches any page, even in the page data", async ({ page }) => {
    const { data } = await database
      .from("programmes")
      .select("internal_school_name")
      .not("internal_school_name", "is", null);
    const names = data!.map((row) => row.internal_school_name!);
    expect(names.length).toBeGreaterThan(0);

    for (const path of paths) {
      await page.goto(path);
      const html = await page.content();
      for (const name of names) expect(html, path).not.toContain(name);
      expect(html, path).not.toContain("internal_school_name");
    }
  });

  test("no never_public price reaches any page", async ({ page }) => {
    const { data } = await database
      .from("prices")
      .select("key, label")
      .eq("never_public", true);
    expect(data!.length).toBeGreaterThan(0);

    for (const path of paths) {
      await page.goto(path);
      const html = await page.content();
      for (const { key } of data!) expect(html, path).not.toContain(key);
    }
  });

  test("no placeholder reaches any page", async ({ page }) => {
    for (const path of paths) {
      await page.goto(path);
      expect(await page.content(), path).not.toContain("PLACEHOLDER");
    }
  });

  test("no guarantee is promised", async ({ page }) => {
    for (const path of paths) {
      await page.goto(path);
      const text = await page.getByRole("main").innerText();
      expect(text, path).not.toMatch(/\bwe guarantee\b|guaranteed (visa|job|admission)/i);
    }
  });

  test("no invented statistics", async ({ page }) => {
    for (const path of paths) {
      await page.goto(path);
      const text = await page.getByRole("main").innerText();
      expect(text, path).not.toMatch(/\d+\s?%|\d{2,}\+/);
    }
  });

  test("immigration pages say the rules can change", async ({ page }) => {
    for (const path of ["/services/visa-applications", "/services/work-abroad"]) {
      await page.goto(path);
      await expect(page.getByRole("main")).toContainText(/current rules/);
    }
  });
});

test.describe("the home page", () => {
  test("prices come from the database", async ({ page }) => {
    await page.goto("/");

    const main = page.getByRole("main");
    await expect(main.getByText("GH¢600").first()).toBeVisible();
    await expect(main.getByText("GH¢1,800")).toBeVisible();
    await expect(main.getByText("GH¢100")).toBeVisible();
    await expect(main.getByText("GH¢200")).toBeVisible();
  });

  test("the LIVE note and booking link come from settings", async ({ page }) => {
    await page.goto("/");

    const main = page.getByRole("main");
    await expect(main.getByText("Weekdays, 12–2pm on TikTok LIVE").first()).toBeVisible();
    await expect(main.getByRole("link", { name: "Book a slot" })).toHaveAttribute(
      "href",
      "https://ernest-links-frontend.vercel.app/book",
    );
  });

  test("the team comes from the database", async ({ page }) => {
    await page.goto("/");

    for (const name of ["Ernest A.", "Priscilla A.", "Nathaniel A."]) {
      await expect(page.getByRole("main").getByText(name)).toBeVisible();
    }
  });

  test("there are no stock photos: the visual is the brand pattern", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("brand-pattern").first()).toBeAttached();
    await expect(page.getByRole("main").getByRole("img")).toHaveCount(0);
  });

  test("the homepage stays under 1.5 MB and 30 requests", async ({ page }) => {
    await page.setViewportSize(phone);
    const client = await page.context().newCDPSession(page);
    await client.send("Network.enable");

    let bytes = 0;
    let requests = 0;
    client.on("Network.requestWillBeSent", () => {
      requests += 1;
    });
    client.on("Network.loadingFinished", ({ encodedDataLength }) => {
      bytes += encodedDataLength;
    });

    await page.goto("/", { waitUntil: "networkidle" });
    console.log(`homepage: ${Math.round(bytes / 1024)} KB, ${requests} requests`);

    expect(bytes).toBeLessThan(1.5 * 1024 * 1024);
    expect(requests).toBeLessThan(30);
  });
});

test.describe("service pages", () => {
  test("programmes show type, city and a correct-as-of date", async ({ page }) => {
    await page.goto("/services/school-applications");
    const section = page.locator("#programmes");

    await expect(section.getByText("Malta · St Julian’s · MBA · 12 months")).toBeVisible();
    await expect(section.getByText(/^Correct as of /).first()).toBeVisible();
    await expect(section.getByRole("link", { name: 'WhatsApp "MALTA MBA"' })).toBeVisible();
  });

  test("the bridging programme appears on work abroad, not the study list", async ({ page }) => {
    await page.goto("/services/work-abroad");
    await expect(page.locator("#open-now")).toContainText("Nursing bridging programme");
    await expect(page.locator("#open-now")).toContainText("Hospitality roles in Dubai");

    await page.goto("/services/school-applications");
    await expect(page.locator("#programmes")).not.toContainText("Nursing bridging programme");
  });

  test("what to bring leaves out the unconfirmed item", async ({ page }) => {
    await page.goto("/services/passports");
    const section = page.locator("#bring");

    await expect(section.getByText("Ghana Card")).toBeVisible();
    await expect(section.getByRole("listitem")).toHaveCount(3);
  });

  test("the express time is hidden while it's a placeholder", async ({ page }) => {
    await page.goto("/services/passports");

    await expect(
      page.getByRole("row", { name: /Typical time to passport/ }),
    ).toContainText("Ask us on WhatsApp");
  });

  test("the drive CTA uses the DRIVE keyword", async ({ page }) => {
    await page.goto("/services/passports");

    await expect(page.getByRole("link", { name: /Plan a drive/ })).toHaveAttribute(
      "href",
      /text=DRIVE/,
    );
  });

  test("each page uses its service's WhatsApp keyword", async ({ page }) => {
    for (const [path, keyword] of [
      ["/services/passports", "PASSPORT"],
      ["/services/school-applications", "STUDY"],
      ["/services/visa-applications", "VISA"],
      ["/services/work-abroad", "WORK"],
      ["/services/exams", "EXAMS"],
    ]) {
      await page.goto(path);
      await expect(
        page.getByRole("link", { name: `WhatsApp "${keyword}"` }),
      ).toHaveAttribute("href", new RegExp(`text=${keyword}$`));
    }
  });

  test("group trips show on travel", async ({ page }) => {
    await page.goto("/services/travel");

    await expect(page.locator("#trips")).toContainText("[Sample] [Trip name]");
  });

  test("each service links to related services", async ({ page }) => {
    await page.goto("/services/exams");

    await expect(
      page.getByRole("heading", { name: "Related services" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /School applications/ }).last(),
    ).toHaveAttribute("href", "/services/school-applications");
  });
});

test.describe("the visa checklist", () => {
  test("the count updates as you tick", async ({ page }) => {
    await page.goto("/services/visa-applications");
    const count = page.getByTestId("readiness-count");
    const section = page.locator("#readiness");

    await expect(count).toHaveText("0 of 6");
    await section.getByRole("checkbox", { name: /A valid passport/ }).check();
    await section.getByRole("checkbox", { name: /Proof of funds/ }).check();
    await expect(count).toHaveText("2 of 6");
  });

  test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });

    test("it's a plain list, with no broken count", async ({ page }) => {
      await page.goto("/services/visa-applications");
      const section = page.locator("#readiness");

      await expect(section.getByRole("checkbox")).toHaveCount(6);
      await expect(page.getByTestId("readiness-count")).toHaveCount(0);
      await expect(section.getByRole("link", { name: "Start your visa online" })).toBeVisible();
    });
  });
});

test.describe("videos", () => {
  test("nothing third-party loads until a video is tapped", async ({ page }) => {
    const external: string[] = [];
    page.on("request", (request) => {
      const { hostname } = new URL(request.url());
      if (hostname !== "localhost") external.push(request.url());
    });
    await page.route(/youtube-nocookie\.com/, (route) =>
      route.fulfill({ contentType: "text/html", body: "<title>Player</title>" }),
    );

    await page.goto("/services/school-applications", { waitUntil: "networkidle" });
    expect(external).toEqual([]);

    await page
      .getByRole("button", { name: /Play video: \[Sample\] Choosing a programme/ })
      .click();

    await expect
      .poll(() => external.some((url) => url.includes("youtube-nocookie.com/embed/sampleVideo1")))
      .toBe(true);
  });

  test("a video keeps its fallback link to the post", async ({ page }) => {
    await page.goto("/services/school-applications");

    await expect(page.getByRole("link", { name: "Watch on YouTube →" })).toHaveAttribute(
      "href",
      "https://www.youtube.com/watch?v=sampleVideo1",
    );
  });
});

for (const [name, viewport] of Object.entries({ desktop, phone })) {
  test.describe(`accessibility on ${name}`, () => {
    test.use({ viewport });

    for (const path of paths) {
      test(`${path} has no axe violations`, async ({ page }) => {
        await page.goto(path);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

        await expectNoAxeViolations(page);
      });
    }
  });
}

for (const path of paths) {
  test(`${path} has no horizontal overflow from 320px to 1600px`, async ({ page }) => {
    await page.goto(path);

    await expectNoHorizontalOverflow(page);
  });
}
