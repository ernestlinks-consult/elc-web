import { expect, test } from "@playwright/test";
import { database, uniquePhone, setOwnIp } from "./leads";
import {
  desktop,
  expectNoAxeViolations,
  expectNoHorizontalOverflow,
  phone,
} from "./shell";

for (const [name, viewport] of Object.entries({ desktop, phone })) {
  test.describe(name, () => {
    test.use({ viewport });

    test("/dev/shell has no axe violations", async ({ page }) => {
      await page.goto("/dev/shell");
      await expect(page.getByRole("main")).toBeVisible();

      await expectNoAxeViolations(page);
    });
  });
}

for (const [name, viewport] of Object.entries({ desktop, phone })) {
  test(`/dev/shell loads with no console errors on ${name}`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.setViewportSize(viewport);
    await page.goto("/dev/shell");
    await page.reload();
    await expect(page.getByRole("main")).toBeVisible();
    await page.waitForLoadState("networkidle");

    expect(errors).toEqual([]);
  });
}

test("the contact form saves to messages", async ({ page }) => {
  const phone = uniquePhone();
  await setOwnIp(page);
  await page.goto("/dev/shell");
  const main = page.getByRole("main");

  await main.getByRole("textbox", { name: /Full name/ }).fill("Ama Mensah");
  await main.getByRole("textbox", { name: /WhatsApp number/ }).fill(phone.typed);
  await main.getByRole("combobox", { name: /Topic/ }).click();
  await page.getByRole("option", { name: "Partnership" }).click();
  await main.getByRole("textbox", { name: /Message/ }).fill("Hello");
  await main.getByRole("checkbox", { name: /I agree/ }).check();
  await main.getByRole("button", { name: "Send message" }).click();

  await expect(main.getByText("reached our team")).toBeVisible();
  const { data } = await database
    .from("messages")
    .select("full_name, topic, body, status")
    .eq("whatsapp", phone.stored);
  expect(data).toEqual([
    { full_name: "Ama Mensah", topic: "Partnership", body: "Hello", status: "new" },
  ]);
});

test("/dev/shell shows the breadcrumb on an inner page", async ({ page }) => {
  await page.goto("/dev/shell");
  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });

  await expect(breadcrumb.locator("[aria-current=page]")).toHaveText(
    "Site shell",
  );
});

test("/dev/shell has no horizontal overflow from 320px to 1600px", async ({
  page,
}) => {
  await page.goto("/dev/shell");

  await expectNoHorizontalOverflow(page);
});
