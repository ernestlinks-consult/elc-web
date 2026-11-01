import { expect, test } from "@playwright/test";
import {
  desktop,
  expectNoAxeViolations,
  expectNoHorizontalOverflow,
  phone,
} from "./shell";

const pages = [
  "/resources",
  "/resources/blog",
  "/resources/blog?topic=exams",
  "/resources/blog/sample-standard-or-express-passport",
  "/resources/scholarships",
  "/resources/scholarships?status=open",
  "/resources/videos",
  "/resources/videos?platform=tiktok",
  "/resources/faqs",
  "/resources/faqs?topic=visa",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/payments",
];

test("every header and footer link resolves", async ({ page, request }) => {
  await page.goto("/");

  const links = await page
    .locator("header a[href^='/'], footer a[href^='/']")
    .evaluateAll((items) => items.map((item) => item.getAttribute("href")!));

  const paths = [...new Set(links.map((href) => href.split("#")[0]))];
  expect(paths.length).toBeGreaterThan(15);

  for (const path of paths) {
    const response = await request.get(path);
    expect(`${path}: ${response.status()}`).toBe(`${path}: 200`);
  }
});

test.describe("every new page", () => {
  for (const path of pages) {
    test(`${path} responds with one H1 and its own canonical`, async ({ page }) => {
      const response = await page.goto(path);

      expect(response!.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

      const canonical = await page.locator("link[rel=canonical]").getAttribute("href");
      const { pathname, search } = new URL(canonical!);
      expect(`${pathname}${search}`).toBe(path);
    });

    for (const [name, viewport] of [["desktop", desktop], ["phone", phone]] as const) {
      test(`${path} passes axe on ${name}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto(path);

        await expectNoAxeViolations(page);
      });
    }
  }

  test("titles and descriptions are all different", async ({ page }) => {
    const seen = { titles: new Set<string>(), descriptions: new Set<string>() };

    for (const path of pages) {
      await page.goto(path);
      seen.titles.add(await page.title());
      seen.descriptions.add(
        (await page.locator("meta[name=description]").getAttribute("content"))!,
      );
    }

    expect(seen.titles.size).toBe(pages.length);
    expect(seen.descriptions.size).toBe(pages.length);
  });

  test("nothing overflows between 320 and 1600px", async ({ page }) => {
    test.setTimeout(240_000);

    for (const path of pages) {
      for (const width of [320, 375, 819, 820, 1600]) {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(path);
        await expectNoHorizontalOverflow(page);
      }
    }
  });
});

test.describe("real 404s", () => {
  for (const path of [
    "/no-such-page",
    "/services/no-such-service",
    "/about/no-such-page",
    "/resources/nope",
    "/resources/blog?topic=nope",
    "/resources/blog?page=0",
    "/resources/blog?page=abc",
    "/resources/blog?page=999",
    "/resources/blog?topic=passports&page=2",
    "/resources/blog/list/nope/1",
    "/resources/blog/no-such-post",
    "/resources/blog/sample-draft-post",
    "/resources/scholarships?status=nope",
    "/resources/videos?platform=nope",
    "/resources/faqs?topic=nope",
  ]) {
    test(`${path} is a 404`, async ({ page }) => {
      const response = await page.goto(path);

      expect(response!.status()).toBe(404);
      await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
    });
  }

  test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });

    for (const path of ["/no-such-page", "/resources/blog?topic=nope"]) {
      test(`${path} still says so`, async ({ page }) => {
        const response = await page.goto(path);

        expect(response!.status()).toBe(404);
        await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
      });
    }
  });

  test("a 404 asks not to be indexed", async ({ page }) => {
    await page.goto("/no-such-page");

    await expect(page.locator("meta[name=robots]").first()).toHaveAttribute("content", /noindex/);
  });

  test("a draft never shows, even in the list", async ({ page }) => {
    await page.goto("/resources/blog");

    await expect(page.getByRole("main")).not.toContainText("Draft post");
  });
});

test.describe("the hub", () => {
  test("has the texture, four sections and the latest rows", async ({ page }) => {
    await page.goto("/resources");

    await expect(page.getByTestId("brand-pattern")).toBeAttached();
    for (const name of ["Blog", "Scholarship Hunt", "Videos", "FAQs"]) {
      await expect(page.getByRole("heading", { level: 2, name, exact: true })).toBeVisible();
    }
    await expect(page.getByRole("heading", { name: "New this week" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "From the blog" })).toBeVisible();
  });
});

test.describe("the blog", () => {
  test("filters by topic with real links", async ({ page }) => {
    await page.goto("/resources/blog");
    await page.getByRole("link", { name: "Exams", exact: true }).click();

    await expect(page).toHaveURL(/topic=exams/);
    await expect(page.getByRole("link", { name: "Exams", exact: true })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(page.getByRole("main")).toContainText("IELTS or TOEFL");
    await expect(page.getByRole("main")).not.toContainText("Standard or express");
  });

  test("shows nine posts on a page, and moves to the next", async ({ page }) => {
    await page.goto("/resources/blog?topic=exams");
    await expect(page.getByRole("main").locator("li a[href^='/resources/blog/']")).toHaveCount(9);

    await page.getByRole("link", { name: "Page 2", exact: true }).click();

    await expect(page).toHaveURL(/topic=exams&page=2/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("The ELC Blog");
  });

  test("a topic with no posts has one action", async ({ page }) => {
    await page.goto("/resources/blog?topic=work_abroad");

    await expect(page.getByText("No posts on this topic yet.")).toBeVisible();
    await expect(page.getByRole("link", { name: "See all posts" })).toBeVisible();
  });

  test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });

    test("filters and pages still work", async ({ page }) => {
      await page.goto("/resources/blog?topic=exams&page=2");

      await expect(page.getByRole("main")).toContainText("Exam tip");
    });
  });
});

test.describe("an article", () => {
  const path = "/resources/blog/sample-standard-or-express-passport";

  test("has its parts", async ({ page }) => {
    await page.goto(path);
    const main = page.getByRole("main");

    await expect(main.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
    await expect(main).toContainText("Passports");
    await expect(main).toContainText(/\d+ min read/);
    await expect(main).toContainText("Grace Y.");
    await expect(
      page.getByTestId("article-body").getByRole("heading", { name: "Which one do you need?" }),
    ).toBeVisible();
    await expect(main.getByRole("link", { name: "Start online" })).toHaveAttribute(
      "href",
      "/start?service=passport",
    );
    await expect(main.getByRole("link", { name: "WhatsApp" })).toHaveAttribute("href", /wa\.me/);
    await expect(main.getByRole("heading", { name: "Keep reading" })).toBeVisible();
  });

  test("uses the article share type", async ({ page }) => {
    await page.goto(path);

    await expect(page.locator("meta[property='og:type']")).toHaveAttribute("content", "article");
    await expect(page.locator("meta[property='og:image']")).toHaveAttribute(
      "content",
      /og-default\.png/,
    );
  });

  test("copy link shows that it worked", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto(path);
    await page.getByRole("link", { name: "Copy link" }).click();

    await expect(page.getByText("Link copied")).toBeVisible();
  });

  test("a post with only Tiptap JSON still renders", async ({ page }) => {
    await page.goto("/resources/blog/sample-ielts-or-toefl");

    await expect(
      page.getByTestId("article-body").getByRole("heading", { name: "Three mistakes to avoid" }),
    ).toBeVisible();
  });

  test("hostile HTML is removed before it reaches the page", async ({ page, request }) => {
    const path = "/resources/blog/sample-sanitiser-check";
    const raw = await (await request.get(path)).text();

    for (const fragment of ["window.hacked", "onerror", "onclick", "<iframe", "javascript:"]) {
      expect(raw).not.toContain(fragment);
    }

    await page.goto(path);
    const body = page.getByTestId("article-body");

    await expect(body).toContainText("Safe paragraph.");
    await expect(body.getByRole("link", { name: "Good link" })).not.toHaveAttribute("style");
    expect(await page.evaluate(() => "hacked" in window)).toBe(false);
  });
});

test.describe("Scholarship Hunt", () => {
  const card = (page: import("@playwright/test").Page, name: string) =>
    page.getByRole("listitem").filter({ has: page.getByRole("heading", { name }) });

  test("status comes from the dates: past, current and future", async ({ page }) => {
    await page.goto("/resources/scholarships");

    await expect(card(page, "Chevening").getByText("Closed", { exact: true })).toBeVisible();
    await expect(card(page, "Erasmus").getByText("Open", { exact: true })).toBeVisible();
    await expect(
      card(page, "Stipendium").getByText("Opening soon", { exact: true }),
    ).toBeVisible();
  });

  test("a card has what a student needs", async ({ page }) => {
    await page.goto("/resources/scholarships");
    const item = card(page, "Erasmus");

    await expect(item).toContainText("Europe (2+ countries)");
    await expect(item).toContainText("Master’s");
    await expect(item).toContainText("Set per programme");
    await expect(item).toContainText("Verified on");
    await expect(item).toContainText("Never pay to apply");
    await expect(item.getByRole("link", { name: /Official page/ })).toHaveAttribute(
      "rel",
      "noopener",
    );
    await expect(item.getByRole("link", { name: /Official page/ })).toHaveAttribute(
      "target",
      "_blank",
    );
    await expect(item.getByRole("link", { name: "Get help applying" })).toHaveAttribute(
      "href",
      "/start?service=school",
    );
  });

  test("the filter shows one status", async ({ page }) => {
    await page.goto("/resources/scholarships?status=closed");

    await expect(page.getByRole("main")).toContainText("Chevening");
    await expect(page.getByRole("main")).not.toContainText("Erasmus");
    await expect(page.getByRole("link", { name: /^Closed/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test("the alerts form is on the page", async ({ page }) => {
    await page.goto("/resources/scholarships");

    await expect(page.locator("#alerts form")).toBeVisible();
  });
});

test.describe("videos", () => {
  test("nothing third-party loads before a tap", async ({ page }) => {
    const external: string[] = [];
    page.on("request", (request) => {
      if (new URL(request.url()).hostname !== "localhost") external.push(request.url());
    });

    await page.goto("/resources/videos", { waitUntil: "networkidle" });

    expect(external).toEqual([]);
  });

  test("pinned videos come first", async ({ page }) => {
    await page.goto("/resources/videos");

    await expect(page.getByRole("main").getByText(/^\[Sample\]/).first()).toContainText(
      "Choosing a programme",
    );
  });

  test("the filter shows one platform", async ({ page }) => {
    await page.goto("/resources/videos?platform=instagram");

    await expect(page.getByRole("main")).toContainText("Malta nursing bridging");
    await expect(page.getByRole("main")).not.toContainText("Getting your passport in Kumasi");
  });
});

test.describe("FAQs", () => {
  test("are grouped, with General last", async ({ page }) => {
    await page.goto("/resources/faqs");

    const headings = await page.getByRole("main").getByRole("heading", { level: 2 }).allTextContents();
    expect(headings).toContain("Passports");
    expect(headings.indexOf("General")).toBeGreaterThan(headings.indexOf("Visas"));
  });

  test("search narrows the list", async ({ page }) => {
    await page.goto("/resources/faqs");
    const main = page.getByRole("main");

    await page.getByLabel("Search the FAQs").fill("embassy");

    await expect(main).toContainText("Can you guarantee my visa?");
    await expect(main).not.toContainText("Where are your offices?");

    await page.getByLabel("Search the FAQs").fill("zzzzz");
    await expect(main).toContainText("No questions match that.");
  });

  test("the topic filter shows one group", async ({ page }) => {
    await page.goto("/resources/faqs?topic=visa");
    const main = page.getByRole("main");

    await expect(main).toContainText("Can you guarantee my visa?");
    await expect(main).not.toContainText("How long does a passport take?");
  });

  test("offers WhatsApp at the end", async ({ page }) => {
    await page.goto("/resources/faqs");

    await expect(page.getByRole("heading", { name: "Still stuck?" })).toBeVisible();
    await expect(
      page.getByRole("main").getByRole("link", { name: "WhatsApp us" }),
    ).toHaveAttribute("href", /wa\.me/);
  });

  test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });

    test("every answer is in the page and opens", async ({ page }) => {
      await page.goto("/resources/faqs");

      await page.getByText("Can you guarantee my visa?").click();

      await expect(page.getByText("The embassy decides.")).toBeVisible();
      await expect(page.getByLabel("Search the FAQs")).toHaveCount(0);
    });
  });
});

test.describe("about", () => {
  test("has the team from the database, and no invented numbers", async ({ page }) => {
    await page.goto("/about");
    const team = page.locator("#team");

    await expect(team).toContainText("Ernest A.");
    await expect(team).toContainText("Outreach Lead");
    await expect(page.getByRole("heading", { name: "Our values" })).toBeVisible();
    await expect(page.getByRole("main")).not.toContainText(/\d+\+/);
  });
});

test.describe("contact", () => {
  test("has four channels and the confirmed offices", async ({ page }) => {
    await page.goto("/contact");
    const main = page.getByRole("main");

    await expect(main.getByRole("link", { name: /WhatsApp/ }).first()).toHaveAttribute(
      "href",
      /wa\.me/,
    );
    await expect(main.getByRole("link", { name: /Second line/ })).toHaveAttribute("href", /^tel:/);
    await expect(main.getByRole("link", { name: /Hotline/ })).toHaveAttribute("href", /^tel:/);
    await expect(main.getByRole("link", { name: /Email/ })).toHaveAttribute("href", /^mailto:/);
    await expect(main).toContainText("Ayeduase, KNUST Engineering Gate office");
    await expect(main).toContainText("Kotei Astro Turf office");
    await expect(main.locator("iframe")).toHaveCount(0);
  });

  test("map links open in a new tab", async ({ page }) => {
    await page.goto("/contact");
    const link = page.getByRole("link", { name: /Get directions to Kotei/ });

    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener");
  });

  test("has the message form and booking link", async ({ page }) => {
    await page.goto("/contact");

    await expect(page.locator("#message form")).toBeVisible();
    await expect(page.getByRole("link", { name: "Book a slot" })).toHaveAttribute(
      "href",
      "https://ernest-links-frontend.vercel.app/book",
    );
  });
});

test.describe("legal pages", () => {
  for (const path of ["/privacy", "/terms", "/payments"]) {
    test(`${path} never shows the placeholder marker`, async ({ page }) => {
      await page.goto(path);

      await expect(page.getByRole("main")).toContainText("finalising this page");
      expect(await page.content()).not.toContain("[PLACEHOLDER");
    });
  }
});

test.describe("the phone home page", () => {
  test.use({ viewport: phone });

  test("follows the Home-Phone section list", async ({ page }) => {
    await page.goto("/");

    const headings = await page
      .getByRole("main")
      .getByRole("heading", { level: 2 })
      .evaluateAll((items) =>
        items
          .filter((item) => (item as HTMLElement).checkVisibility())
          .map((item) => item.textContent),
      );

    expect(headings).toEqual([
      "Six services. One team. One WhatsApp number.",
      "Start free on our LIVE. Go deeper with our CEO.",
      "Your passport, without the queue stress.",
      "Trusted by KNUST colleges and associations.",
      "Learn before you spend.",
      "Making impact through education and travels.",
      "Send us a message.",
    ]);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  });

  test("repeated content steps aside", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("home-team")).toBeHidden();
    await expect(page.locator("#contact form")).toBeHidden();
    await expect(page.locator("#contact").getByRole("link", { name: "Send us a message" })).toBeVisible();
  });

  test("the desktop page keeps everything", async ({ page }) => {
    await page.setViewportSize(desktop);
    await page.goto("/");

    await expect(page.getByTestId("home-team")).toBeVisible();
    await expect(page.locator("#contact form")).toBeVisible();
    await expect(page.locator("#contact").getByRole("link", { name: "Send us a message" })).toBeHidden();
  });
});
