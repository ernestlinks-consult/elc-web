import { expect, test } from "@playwright/test";

test("home page responds", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.ok()).toBe(true);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("token preview is not available in production", async ({ page }) => {
  const response = await page.goto("/dev/tokens");

  expect(response?.status()).toBe(404);
});
