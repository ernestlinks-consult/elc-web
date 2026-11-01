import { expect, test } from "@playwright/test";
import {
  database,
  fillStepOne,
  leadByPhone,
  saveButton,
  startLead,
  stepOneChoices,
  uniquePhone,
  useOwnIp,
} from "./leads";
import {
  desktop,
  expectNoAxeViolations,
  expectNoHorizontalOverflow,
  phone as phoneViewport,
} from "./shell";

const finishLater = "Finish later, just contact me";
const services = Object.keys(stepOneChoices);

test.beforeEach(async ({ page }) => {
  await useOwnIp(page);
});

for (const service of services) {
  const { tab, prefix } = stepOneChoices[service];

  test(`${tab}: step 1 reaches the thank-you page with a reference`, async ({
    page,
  }) => {
    const phone = uniquePhone();

    await startLead(page, service, phone.typed);
    await page.getByRole("button", { name: finishLater }).click();

    await page.waitForURL("**/start/done**");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Thank you. You’re on our list.",
    );
    await expect(page.getByText(new RegExp(`ELC-${prefix}-\\d+`))).toBeVisible();

    const [lead] = await leadByPhone(phone.stored);
    expect(lead.service_key).toBe(service);
    expect(lead.status).toBe("new");
    expect(lead.steps_completed).toBe(1);
  });
}

test("all passport steps save, and Back keeps answers", async ({ page }) => {
  const phone = uniquePhone();
  await startLead(page, "passport", phone.typed);
  const main = page.getByRole("main");

  await expect(main.getByRole("heading", { name: "About you" })).toBeVisible();
  await main.getByRole("radio", { name: "Mr", exact: true }).check();
  await main.getByRole("textbox", { name: "Surname" }).fill("Mensah");
  await main.getByLabel("Date of birth").fill("1999-02-03");
  await main.getByRole("combobox", { name: "Marital status" }).click();
  await page.getByRole("option", { name: "Single" }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(
    main.getByRole("heading", { name: "Contact & address" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Back" }).click();

  await expect(main.getByRole("textbox", { name: "Surname" })).toHaveValue(
    "Mensah",
  );
  await expect(main.getByRole("radio", { name: "Mr", exact: true })).toBeChecked();
  await expect(main.getByRole("combobox", { name: "Marital status" })).toHaveText(
    /Single/,
  );
  await page.getByRole("button", { name: "Continue" }).click();

  for (const title of ["Contact & address", "Education", "Family", "Guarantors"]) {
    await expect(main.getByRole("heading", { name: title })).toBeVisible();
    await page.getByRole("button", { name: "Continue" }).click();
  }

  await expect(
    main.getByRole("heading", { name: "Review & confirm" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: finishLater })).toHaveCount(0);

  await page.getByRole("button", { name: "Send my application" }).click();
  await expect(page.getByText("Tick the box to confirm")).toBeVisible();
  await main.getByRole("checkbox", { name: /I confirm/ }).check();
  await page.getByRole("button", { name: "Send my application" }).click();

  await page.waitForURL("**/start/done**");
  await expect(page.getByText("What happens next")).toBeVisible();
  await expect(page.getByText("Grace will message you")).toBeVisible();

  const [lead] = await leadByPhone(phone.stored);
  expect(lead).toMatchObject({ steps_completed: 7, is_partial: false });

  const { data: steps } = await database
    .from("lead_steps")
    .select("step_key, answers")
    .eq("lead_id", lead.id)
    .order("step_index");
  expect(steps).toHaveLength(7);
  expect(steps![1].answers).toMatchObject({
    surname: "Mensah",
    date_of_birth: "1999-02-03",
    marital_status: "Single",
  });

  const { data: events } = await database
    .from("events")
    .select("name")
    .eq("lead_id", lead.id);
  const names = events!.map((event) => event.name);
  // Seven steps, plus "About you" saved again after Back.
  expect(names.filter((name) => name === "step_saved")).toHaveLength(8);
  expect(names.filter((name) => name === "form_completed")).toHaveLength(1);
});

test("a new lead enqueues one SMS and one owner email, nothing sent", async ({
  page,
}) => {
  const phone = uniquePhone();
  await startLead(page, "school", phone.typed);

  const [lead] = await leadByPhone(phone.stored);
  const { data } = await database
    .from("notifications")
    .select("channel, to_address, template, status")
    .eq("lead_id", lead.id)
    .order("channel");

  expect(data).toEqual([
    {
      channel: "sms",
      to_address: phone.stored,
      template: "lead_ack_sms",
      status: "pending",
    },
    {
      channel: "email",
      to_address: "peace@example.test",
      template: "lead_new_owner_email",
      status: "pending",
    },
  ]);
});

test("Finish later marks the lead partial", async ({ page }) => {
  const phone = uniquePhone();
  await startLead(page, "visa", phone.typed);

  await page.getByRole("button", { name: finishLater }).click();
  await page.waitForURL("**/start/done**");

  const [lead] = await leadByPhone(phone.stored);
  expect(lead).toMatchObject({ is_partial: true, steps_completed: 1 });
});

test("empty step 1 shows errors, a summary and moves focus", async ({ page }) => {
  await page.goto("/start");
  await saveButton(page).click();

  const main = page.getByRole("main");
  await expect(main.getByText("Enter your full name.")).toBeVisible();
  await expect(main.getByText("Tick the box so we can contact you.")).toBeVisible();
  await expect(main.getByText(/Please check \d answers/)).toBeVisible();
  await expect(main.getByRole("textbox", { name: "Full name" })).toBeFocused();
  await expect(main.getByRole("textbox", { name: "Full name" })).toHaveAttribute(
    "aria-invalid",
    "true",
  );
});

test("one error shows no summary, and a bad number is explained", async ({
  page,
}) => {
  await page.goto("/start");
  await fillStepOne(page, "passport", "12345");
  await saveButton(page).click();

  const main = page.getByRole("main");
  await expect(main.getByText("Enter a Ghana phone number")).toBeVisible();
  await expect(main.getByText(/Please check/)).toHaveCount(0);
  await expect(main.getByRole("textbox", { name: "WhatsApp number" })).toBeFocused();
});

test("a future birth date is refused", async ({ page }) => {
  await startLead(page, "passport", uniquePhone().typed);

  await page.getByRole("main").getByLabel("Date of birth").fill("2099-01-01");
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByText("This date must be in the past.")).toBeVisible();
});

test("a filled honeypot is dropped silently", async ({ page }) => {
  const phone = uniquePhone();
  await page.goto("/start");
  await fillStepOne(page, "passport", phone.typed);
  await page
    .locator("main input[name=website]")
    .evaluate((input: HTMLInputElement) => {
      input.value = "https://spam.example";
    });

  await saveButton(page).click();

  await page.waitForURL("**/start/done");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText(/ELC-/)).toHaveCount(0);
  expect(await leadByPhone(phone.stored)).toEqual([]);
});

test("the honeypot is out of reach for people", async ({ page }) => {
  await page.goto("/start");
  const trap = page.locator("main input[name=website]");

  await expect(trap).toHaveAttribute("tabindex", "-1");
  await expect(trap).toHaveAttribute("autocomplete", "off");
  await expect(page.locator("main div:has(> label > input[name=website])")).toHaveAttribute(
    "aria-hidden",
    "true",
  );
});

test("a duplicate submit attaches to the same lead", async ({ page, browser }) => {
  const phone = uniquePhone();
  await startLead(page, "exams", phone.typed);
  const [first] = await leadByPhone(phone.stored);

  const other = await browser.newContext();
  const second = await other.newPage();
  await useOwnIp(second);
  await startLead(second, "exams", phone.typed);
  await second.getByRole("button", { name: finishLater }).click();
  await second.waitForURL("**/start/done**");

  await expect(second.getByText(first.ref)).toBeVisible();
  expect(await leadByPhone(phone.stored)).toHaveLength(1);

  const { count } = await database
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("lead_id", first.id);
  expect(count).toBe(2);
  await other.close();
});

test("tabs deep-link, and an unknown service falls back", async ({ page }) => {
  await page.goto("/start?service=visa");
  const tabs = page.getByRole("navigation", { name: "Choose a service" });

  await expect(tabs.locator("[aria-current=page]")).toHaveText("Visa");
  await expect(page.getByRole("radio", { name: "Student" })).toBeVisible();

  await tabs.getByRole("link", { name: "Travel" }).focus();
  await page.keyboard.press("Enter");
  await page.waitForURL("**/start?service=travel");
  await expect(tabs.locator("[aria-current=page]")).toHaveText("Travel");
  await expect(page.getByRole("checkbox", { name: "Flight" })).toBeVisible();

  await page.goto("/start?service=nonsense");
  await expect(tabs.locator("[aria-current=page]")).toHaveText("Passport");
});

test("attribution is stored on the lead", async ({ page }) => {
  const phone = uniquePhone();
  await page.goto(
    "/start?service=travel&utm_source=tiktok&utm_medium=social&utm_campaign=drive",
  );
  await fillStepOne(page, "travel", phone.typed);
  await saveButton(page).click();
  await expect(page.getByText("Saved. We have your details")).toBeVisible();

  const [lead] = await leadByPhone(phone.stored);
  expect(lead).toMatchObject({
    utm_source: "tiktok",
    utm_medium: "social",
    utm_campaign: "drive",
  });
  expect(lead.source_page).toMatch(/^\/start/);
});

test("form_open is recorded", async ({ page }) => {
  const opened = page.waitForResponse(
    (response) => response.request().method() === "POST",
  );
  await page.goto("/start?service=exams");
  await opened;

  await expect
    .poll(async () => {
      const { count } = await database
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("name", "form_open");
      return count;
    })
    .toBeGreaterThan(0);
});

test("the session cookie is httpOnly, Secure and Lax, and no URL holds the lead id", async ({
  page,
  context,
}) => {
  const phone = uniquePhone();
  await startLead(page, "passport", phone.typed);
  await page.getByRole("button", { name: finishLater }).click();
  await page.waitForURL("**/start/done**");

  const cookie = (await context.cookies()).find(({ name }) => name === "elc_lead")!;
  expect(cookie).toMatchObject({ httpOnly: true, secure: true, sameSite: "Lax" });

  const [lead] = await leadByPhone(phone.stored);
  expect(page.url()).not.toContain(lead.id);
  expect(new URL(page.url()).searchParams.get("ref")).toBe(lead.ref);
});

test("a forged cookie gets the generic thank-you, and ?ref= looks nothing up", async ({
  page,
  context,
}) => {
  await context.addCookies([
    {
      name: "elc_lead",
      value: "11111111-1111-4111-8111-111111111111.9999999999999.forged",
      url: "http://localhost:3000",
    },
  ]);

  await page.goto("/start/done?ref=ELC-PP-1042");

  await expect(page.getByText("ELC-PP-1042")).toBeVisible();
  await expect(page.getByText("We will message you")).toBeVisible();
  await expect(page.getByText("What happens next")).toHaveCount(0);
});

test("?ref= that is not a reference is not shown", async ({ page }) => {
  await page.goto("/start/done?ref=<script>alert(1)</script>");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("Your reference is")).toHaveCount(0);
});

test("the reference is prefilled in Message us now", async ({ page }) => {
  const phone = uniquePhone();
  await startLead(page, "work", phone.typed);
  await page.getByRole("button", { name: finishLater }).click();
  await page.waitForURL("**/start/done**");

  const [lead] = await leadByPhone(phone.stored);
  await expect(page.getByRole("link", { name: "Message us now" })).toHaveAttribute(
    "href",
    `https://wa.me/233537783166?text=${lead.ref}`,
  );
});

test("a failed save keeps typed values and says so", async ({ page }) => {
  await startLead(page, "passport", uniquePhone().typed);
  const surname = page.getByRole("main").getByRole("textbox", { name: "Surname" });
  await surname.fill("Mensah");

  await page.route("**/start**", (route) =>
    route.request().method() === "POST" ? route.abort() : route.continue(),
  );
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(
    page.getByText("Couldn’t save. Check your connection and try again."),
  ).toBeVisible();
  await expect(surname).toHaveValue("Mensah");

  await page.unroute("**/start**");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(
    page.getByRole("main").getByRole("heading", { name: "Contact & address" }),
  ).toBeVisible();
});

test("the sixth form from one IP gets a friendly message, no CAPTCHA", async ({
  page,
}) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await startLead(page, "travel", uniquePhone().typed);
  }

  const phone = uniquePhone();
  await page.goto("/start?service=travel");
  await fillStepOne(page, "travel", phone.typed);
  await saveButton(page).click();

  await expect(page.getByText("You’ve sent a few forms")).toBeVisible();
  await expect(page.getByRole("main").getByRole("textbox", { name: "Full name" })).toHaveValue(
    "Test Lead",
  );
  expect(await leadByPhone(phone.stored)).toEqual([]);
});

test("the footer alerts form saves a normalised number", async ({ page }) => {
  const phone = uniquePhone();
  await page.goto("/");
  const footer = page.getByRole("contentinfo");

  await footer.getByRole("textbox", { name: /WhatsApp number/ }).fill(phone.typed);
  await footer.getByRole("checkbox", { name: /I agree/ }).check();
  await footer.getByRole("button", { name: "Subscribe" }).click();

  await expect(footer.getByText("You’re on the list")).toBeVisible();
  const { data } = await database
    .from("subscribers")
    .select("whatsapp, list, consent_at")
    .eq("whatsapp", phone.stored);
  expect(data).toHaveLength(1);
  expect(data![0].consent_at).toBeTruthy();
});

test("a footer honeypot saves nothing and looks like success", async ({ page }) => {
  const phone = uniquePhone();
  await page.goto("/");
  const footer = page.getByRole("contentinfo");

  await footer.getByRole("textbox", { name: /WhatsApp number/ }).fill(phone.typed);
  await footer.getByRole("checkbox", { name: /I agree/ }).check();
  await footer.locator("input[name=website]").fill("spam", { force: true });
  await footer.getByRole("button", { name: "Subscribe" }).click();

  await expect(footer.getByText("You’re on the list")).toBeVisible();
  const { data } = await database
    .from("subscribers")
    .select("id")
    .eq("whatsapp", phone.stored);
  expect(data).toEqual([]);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("step 1 makes a lead and shows the reference", async ({ page }) => {
    const phone = uniquePhone();
    await page.goto("/start?service=exams");
    await fillStepOne(page, "exams", phone.typed);
    await saveButton(page).click();

    await expect(page.getByText(/ELC-EX-\d+/)).toBeVisible();
    await expect(page.getByText("Thank you. You’re on our list.")).toBeVisible();

    const [lead] = await leadByPhone(phone.stored);
    expect(lead).toMatchObject({ service_key: "exams", steps_completed: 1 });
  });

  test("attribution still comes through from the page URL", async ({ page }) => {
    const phone = uniquePhone();
    await page.goto("/start?service=exams&utm_source=instagram&utm_campaign=ielts");
    await fillStepOne(page, "exams", phone.typed);
    await saveButton(page).click();
    await expect(page.getByText(/ELC-EX-\d+/)).toBeVisible();

    const [lead] = await leadByPhone(phone.stored);
    expect(lead).toMatchObject({
      source_page: "/start",
      utm_source: "instagram",
      utm_campaign: "ielts",
    });
  });

  test("errors come back with typed values kept", async ({ page }) => {
    await page.goto("/start?service=exams");
    await page.getByRole("main").getByRole("textbox", { name: "Full name" }).fill("Ama");
    await saveButton(page).click();

    await expect(page.getByText("Enter a WhatsApp number")).toBeVisible();
    await expect(
      page.getByRole("main").getByRole("textbox", { name: "Full name" }),
    ).toHaveValue("Ama");
  });

  test("tabs still work", async ({ page }) => {
    await page.goto("/start");
    await page
      .getByRole("navigation", { name: "Choose a service" })
      .getByRole("link", { name: "Visa" })
      .click();

    await expect(page.getByRole("radio", { name: "Student" })).toBeVisible();
  });

  test("/start/done shows a usable generic thank-you", async ({ page }) => {
    await page.goto("/start/done");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Thank you. You’re on our list.",
    );
  });
});

for (const service of services) {
  test(`/start?service=${service} has no axe violations`, async ({ page }) => {
    await page.goto(`/start?service=${service}`);
    await expect(saveButton(page)).toBeVisible();

    await expectNoAxeViolations(page);
  });
}

test("/start with errors has no axe violations", async ({ page }) => {
  await page.goto("/start");
  await saveButton(page).click();
  await expect(page.getByText(/Please check/)).toBeVisible();

  await expectNoAxeViolations(page);
});

test("a later step has no axe violations", async ({ page }) => {
  await startLead(page, "school", uniquePhone().typed);

  await expectNoAxeViolations(page);
});

test("/start/done has no axe violations", async ({ page }) => {
  await startLead(page, "passport", uniquePhone().typed);
  await page.getByRole("button", { name: finishLater }).click();
  await page.waitForURL("**/start/done**");
  await expect(page.getByText("What happens next")).toBeVisible();

  await expectNoAxeViolations(page);
});

test("the Start online journey logs no browser errors", async ({ page }) => {
  const errors: string[] = [];
  const missing: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("404")) {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() === 404) {
      missing.push(new URL(response.url()).pathname);
    }
  });

  await startLead(page, "school", uniquePhone().typed);
  await page.getByRole("button", { name: finishLater }).click();
  await page.waitForURL("**/start/done**");
  await expect(page.getByText("What happens next")).toBeVisible();

  expect(errors).toEqual([]);
  // TODO(step 6): the shell links to these pages, so the router prefetches them.
  // Once they exist, nothing should 404 here.
  expect(
    missing.filter(
      (path) =>
        !/^\/(about|contact|privacy|terms|payments|resources|services)(\/|$)/.test(
          path,
        ),
    ),
  ).toEqual([]);
});

test("/start has no horizontal overflow from 320px to 1600px", async ({ page }) => {
  await page.goto("/start?service=school");

  await expectNoHorizontalOverflow(page);
});

test("/start/done has no horizontal overflow from 320px to 1600px", async ({
  page,
}) => {
  await page.goto("/start/done");

  await expectNoHorizontalOverflow(page);
});

test("the widest later step has no horizontal overflow", async ({ page }) => {
  await startLead(page, "passport", uniquePhone().typed);

  await expectNoHorizontalOverflow(page);
});

test.describe("on a phone", () => {
  test.use({ viewport: phoneViewport });

  test("the phone bar never covers the form buttons", async ({ page }) => {
    await startLead(page, "passport", uniquePhone().typed);
    const bar = page.locator("nav[aria-label='Quick actions']");

    for (const name of ["Back", finishLater, "Continue"]) {
      const button = page.getByRole("button", { name });
      await button.scrollIntoViewIfNeeded();

      const buttonBox = (await button.boundingBox())!;
      const barBox = (await bar.boundingBox())!;
      expect(buttonBox.y + buttonBox.height, name).toBeLessThanOrEqual(barBox.y);
    }
  });

  test("Save and continue is reachable by keyboard above the bar", async ({
    page,
  }) => {
    await page.goto("/start");
    const save = saveButton(page);
    await save.focus();

    const saveBox = (await save.boundingBox())!;
    const barBox = (await page
      .locator("nav[aria-label='Quick actions']")
      .boundingBox())!;
    expect(saveBox.y + saveBox.height).toBeLessThanOrEqual(barBox.y);
  });

  test("controls meet the 44px touch target", async ({ page }) => {
    await page.goto("/start");

    const small = await page
      .locator("main a, main button, main label:has(input[type=radio])")
      .evaluateAll((elements) =>
        elements
          .filter((element) => element.getClientRects().length > 0)
          .filter((element) => element.getBoundingClientRect().height < 44)
          .map((element) => element.textContent),
      );

    expect(small).toEqual([]);
  });
});

test.describe("desktop", () => {
  test.use({ viewport: desktop });

  test("the side panel never shows a placeholder", async ({ page }) => {
    await page.goto("/start");
    await expect(page.getByRole("complementary", { name: "Why it’s safe" })).toBeVisible();

    expect(await page.locator("main").textContent()).not.toContain("[PLACEHOLDER");
  });
});
