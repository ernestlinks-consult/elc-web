import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("token preview has no axe violations", async ({ page }) => {
  await page.goto("/dev/tokens");

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});

test("body font is DM Sans", async ({ page }) => {
  await page.goto("/dev/tokens");

  const fontFamily = await page.evaluate(
    () => getComputedStyle(document.body).fontFamily,
  );

  expect(fontFamily).toMatch(/^["']?DM Sans/);
});
