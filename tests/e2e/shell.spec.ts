import { expect, test } from "@playwright/test";
import {
  desktop,
  expectNoAxeViolations,
  expectNoHorizontalOverflow,
  phone,
} from "./shell";

const phoneBar = "nav[aria-label='Quick actions']";

test.describe("desktop", () => {
  test.use({ viewport: desktop });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("/ has no axe violations", async ({ page }) => {
    await expectNoAxeViolations(page);
  });

  test("an open menu has no axe violations", async ({ page }) => {
    await page.getByRole("button", { name: "Services" }).click();
    await expect(
      page
        .getByRole("navigation", { name: "Main" })
        .getByRole("link", { name: /Travel/ }),
    ).toBeVisible();

    await expectNoAxeViolations(page);
  });

  test("the skip link is first and moves focus to main", async ({ page }) => {
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();

    await page.keyboard.press("Enter");

    await expect(page.locator("main#main")).toBeFocused();
  });

  test("header menus work with the keyboard alone", async ({ page }) => {
    const main = page.getByRole("navigation", { name: "Main" });
    const services = main.getByRole("button", { name: "Services" });
    const resources = main.getByRole("button", { name: "Blog & Resources" });

    await services.focus();
    await page.keyboard.press("Enter");
    await expect(services).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Tab");
    await expect(main.getByRole("link", { name: /Passports/ })).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(services).toHaveAttribute("aria-expanded", "false");
    await expect(services).toBeFocused();

    await resources.focus();
    await page.keyboard.press("Space");
    await expect(
      main.getByRole("link", { name: /Scholarship Hunt/ }),
    ).toBeVisible();

    for (let press = 0; press < 4; press += 1) {
      await page.keyboard.press("Tab");
    }
    await expect(main.getByRole("link", { name: /FAQs/ })).toBeFocused();

    await page.keyboard.press("Enter");
    await page.waitForURL("**/resources/faqs");
  });

  test("the phone bar and menu button are hidden", async ({ page }) => {
    await expect(page.locator(phoneBar)).toBeHidden();
    await expect(page.getByRole("button", { name: "Menu" })).toBeHidden();
  });

  test("the top bar shows phones, hours and the LIVE note", async ({ page }) => {
    const bar = page.getByRole("complementary", { name: "Contact and LIVE" });

    await expect(bar).toContainText("+233 53 778 3166");
    await expect(bar).toContainText("+233 20 401 0168");
    await expect(
      bar.getByRole("link", { name: "Hotline 032 229 1161" }),
    ).toHaveAttribute("href", "tel:+233322291161");
    await expect(bar).toContainText("Mon–Fri, 8:00–17:00");
    await expect(bar).toContainText("Weekdays, 12–2pm on TikTok LIVE");
  });

  test("office directions open the map in a new tab", async ({ page }) => {
    const footer = page.getByRole("contentinfo");

    for (const [office, url] of [
      [
        "Ayeduase, KNUST Engineering Gate office",
        "https://share.google/aOoUoDOERXanDgkHx",
      ],
      ["Kotei Astro Turf office", "https://share.google/kju8X4z7czM9tZf0y"],
    ]) {
      const link = footer.getByRole("link", {
        name: `Directions to ${office} (opens in a new tab)`,
      });

      await expect(link).toHaveAttribute("href", url);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", "noopener");
    }
  });

  test("the footer shows the current year", async ({ page }) => {
    await expect(page.getByRole("contentinfo")).toContainText(
      `© ${new Date().getFullYear()} ErnestLinks Consult`,
    );
  });

  test("every internal shell link uses a URL from the IA", async ({ page }) => {
    const hrefs = await page
      .locator("header a[href^='/'], footer a[href^='/']")
      .evaluateAll((links) =>
        links.map((link) => link.getAttribute("href") as string),
      );
    const known =
      /^\/($|start$|about(#team)?$|contact$|privacy$|terms$|payments$|resources(\/(blog|scholarships|videos|faqs))?$|services\/(passports(#birth)?|school-applications|visa-applications|work-abroad|exams|travel)$)/;

    expect(hrefs.length).toBeGreaterThan(20);
    expect(hrefs.filter((href) => !known.test(href))).toEqual([]);
  });
});

test.describe("phone", () => {
  test.use({ viewport: phone });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("/ has no axe violations", async ({ page }) => {
    await expectNoAxeViolations(page);
  });

  test("the open menu has no axe violations", async ({ page }) => {
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await expectNoAxeViolations(page);
  });

  test("the phone bar shows its three actions", async ({ page }) => {
    const bar = page.locator(phoneBar);

    await expect(bar).toBeVisible();
    await expect(bar.getByRole("link", { name: "Start online" })).toHaveAttribute(
      "href",
      "/start",
    );
    await expect(bar.getByRole("link", { name: "WhatsApp" })).toHaveAttribute(
      "href",
      "https://wa.me/233537783166?text=HELLO",
    );
    await expect(bar.getByRole("link", { name: "Call" })).toHaveAttribute(
      "href",
      "tel:+233537783166",
    );
  });

  test("the phone bar stays on screen while scrolling", async ({ page }) => {
    await page.mouse.wheel(0, 300);

    await expect(page.locator(phoneBar)).toBeInViewport({ ratio: 1 });
  });

  test("the phone bar never overlaps the footer's last link", async ({
    page,
  }) => {
    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight),
    );

    const lastLink = page.locator("footer a").last();
    const linkBox = await lastLink.boundingBox();
    const barBox = await page.locator(phoneBar).boundingBox();

    expect(linkBox!.y + linkBox!.height).toBeLessThanOrEqual(barBox!.y);
  });

  test("focus is never hidden behind the phone bar", async ({ page }) => {
    const bar = await page.locator(phoneBar).elementHandle();

    for (let press = 0; press < 45; press += 1) {
      await page.keyboard.press("Tab");

      const hidden = await page.evaluate((barElement) => {
        const active = document.activeElement as HTMLElement;
        if (active === document.body || barElement?.contains(active)) {
          return null;
        }
        const box = active.getBoundingClientRect();
        const barTop = barElement!.getBoundingClientRect().top;
        return box.bottom > barTop ? active.textContent : null;
      }, bar);

      expect(hidden).toBeNull();
    }
  });

  test("the menu locks scrolling, traps focus and closes on Escape", async ({
    page,
  }) => {
    const button = page.getByRole("button", { name: "Menu" });
    await button.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Menu" });
    await expect(dialog).toBeVisible();

    const box = await dialog.boundingBox();
    expect(box!.height).toBe(phone.height);

    await page.mouse.move(10, 300);
    await page.mouse.wheel(0, 400);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    for (let press = 0; press < 30; press += 1) {
      await page.keyboard.press("Tab");
      const inside = await dialog.evaluate((element) =>
        element.contains(document.activeElement),
      );
      expect(inside).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(button).toBeFocused();
  });

  test("shell controls meet the 44px touch target", async ({ page }) => {
    const small = await page
      .locator(
        "aside a, header a, header button, footer a, footer button, nav[aria-label='Quick actions'] a",
      )
      .evaluateAll((elements) =>
        elements
          .filter((element) => element.getClientRects().length > 0)
          .filter((element) => element.getBoundingClientRect().height < 44)
          .map((element) => element.textContent),
      );

    expect(small).toEqual([]);
  });
});

test("/ has no horizontal overflow from 320px to 1600px", async ({ page }) => {
  await page.goto("/");

  await expectNoHorizontalOverflow(page);
});
