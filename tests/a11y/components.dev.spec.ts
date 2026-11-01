import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const focusRing =
  /rgb\(255, 255, 255\) 0px 0px 0px 3px, rgb\(5, 5, 198\) 0px 0px 0px 6px/;

async function openPreview(page: Page) {
  await page.goto("/dev/components");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

async function expectNoViolations(page: Page) {
  // The Next.js dev tools are not part of the app.
  const results = await new AxeBuilder({ page })
    .exclude("nextjs-portal")
    .analyze();

  expect(results.violations).toEqual([]);
}

test("component preview has no axe violations", async ({ page }) => {
  await openPreview(page);

  await expectNoViolations(page);
});

test("an open dialog has no axe violations", async ({ page }) => {
  await openPreview(page);

  await page.getByRole("button", { name: "Open dialog" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();

  await expectNoViolations(page);
});

test("toasts have no axe violations", async ({ page }) => {
  await openPreview(page);

  for (const tone of ["neutral", "success", "error"]) {
    await page.getByRole("button", { name: `Show ${tone} toast` }).click();
  }
  await expect(
    page.getByRole("region", { name: /notifications/i }),
  ).toContainText("Couldn't save");

  await expectNoViolations(page);
});

test("an open select has no axe violations", async ({ page }) => {
  await openPreview(page);

  await page.getByRole("combobox", { name: "Country", exact: true }).click();
  await expect(page.getByRole("listbox")).toBeVisible();

  // Radix hides the rest of the page from assistive tech while the list is open.
  const results = await new AxeBuilder({ page })
    .include("[role=listbox]")
    .analyze();

  expect(results.violations).toEqual([]);
});

test("every tab stop shows the focus ring", async ({ page }) => {
  await openPreview(page);

  let stops = 0;

  for (let press = 0; press < 150; press += 1) {
    await page.keyboard.press("Tab");

    const focused = await page.evaluate(() => {
      const element = document.activeElement as HTMLElement;
      const isRepeat = element.hasAttribute("data-tab-stop");
      element.setAttribute("data-tab-stop", "");
      return {
        isBody: element === document.body,
        isDevTools: element.tagName === "NEXTJS-PORTAL",
        isRepeat,
        label: `${element.tagName} ${element.getAttribute("type") ?? ""} ${element.textContent?.slice(0, 40)}`,
        boxShadow: getComputedStyle(element).boxShadow,
        width: element.getBoundingClientRect().width,
      };
    });

    if (focused.isDevTools) continue;
    if (focused.isBody) {
      if (stops > 0) break;
      continue;
    }
    if (focused.isRepeat) break;

    stops += 1;
    expect.soft(focused.boxShadow, focused.label).toMatch(focusRing);
    expect.soft(focused.width, focused.label).toBeGreaterThan(0);
  }

  expect(stops).toBeGreaterThan(40);
});
