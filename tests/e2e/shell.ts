import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

export const desktop = { width: 1280, height: 800 };
export const phone = { width: 375, height: 700 };

export async function expectNoAxeViolations(page: Page) {
  // The Next.js dev tools are not part of the app.
  const results = await new AxeBuilder({ page })
    .exclude("nextjs-portal")
    .analyze();

  expect(results.violations).toEqual([]);
}

export async function expectNoHorizontalOverflow(page: Page) {
  for (const width of [320, 375, 480, 768, 819, 820, 1024, 1280, 1600]) {
    await page.setViewportSize({ width, height: 800 });

    const { overflow, offenders } = await page.evaluate(() => {
      const root = document.documentElement;

      return {
        overflow: root.scrollWidth - root.clientWidth,
        offenders: [...document.querySelectorAll("body *")]
          .filter(
            (element) =>
              element.getBoundingClientRect().right > root.clientWidth + 0.5,
          )
          .slice(0, 5)
          .map((element) => `${element.tagName}.${element.getAttribute("class")}`),
      };
    });

    expect(
      overflow,
      `sideways scroll at ${width}px: ${offenders.join(", ")}`,
    ).toBeLessThanOrEqual(0);
  }
}
