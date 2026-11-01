import { expect, test } from "@playwright/test";

for (const path of ["/dev/tokens", "/dev/components", "/dev/shell"]) {
  test(`${path} is not available in production`, async ({ page }) => {
    const response = await page.goto(path);

    expect(response?.status()).toBe(404);
  });
}
