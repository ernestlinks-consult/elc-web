import { randomInt } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { expect, type Page } from "@playwright/test";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

export const database = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

/** Fresh number each time, so tests never trip the real rate limits. */
export function uniquePhone() {
  const local = `24${String(randomInt(0, 10_000_000)).padStart(7, "0")}`;
  return { typed: `0${local}`, stored: `+233${local}` };
}

/** Rate limits are per IP, so each test gets its own. */
export async function setOwnIp(page: Page) {
  await page.setExtraHTTPHeaders({
    "x-forwarded-for": `10.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 255)}`,
  });
}

export const stepOneChoices: Record<
  string,
  { tab: string; radios: string[]; checkboxes?: string[]; prefix: string }
> = {
  passport: {
    tab: "Passport",
    radios: ["Standard · GH¢600", "New passport"],
    prefix: "PP",
  },
  birth: { tab: "Birth certificate", radios: ["Me", "New certificate"], prefix: "BC" },
  school: { tab: "School applications", radios: ["Master’s"], prefix: "SA" },
  visa: { tab: "Visa", radios: ["Student"], prefix: "VS" },
  work: { tab: "Work abroad", radios: ["A job opening"], prefix: "WA" },
  exams: { tab: "Exams", radios: ["TOEFL", "Both"], prefix: "EX" },
  travel: { tab: "Travel", radios: [], checkboxes: ["Flight"], prefix: "TR" },
};

export async function fillStepOne(
  page: Page,
  service: string,
  phone: string,
  name = "Test Lead",
) {
  const main = page.getByRole("main");
  const { radios, checkboxes = [] } = stepOneChoices[service];

  await main.getByRole("textbox", { name: "Full name" }).fill(name);
  await main.getByRole("textbox", { name: "WhatsApp number" }).fill(phone);
  for (const radio of radios) {
    await main.getByRole("radio", { name: radio, exact: true }).check();
  }
  for (const checkbox of checkboxes) {
    await main.getByRole("checkbox", { name: checkbox, exact: true }).check();
  }
  await main.getByRole("radio", { name: "Any time" }).check();
  await main.getByRole("checkbox", { name: /I agree/ }).check();
}

export const saveButton = (page: Page) =>
  page.getByRole("button", { name: "Save and continue" });

export async function startLead(page: Page, service: string, phone: string) {
  await page.goto(`/start?service=${service}`);
  await fillStepOne(page, service, phone);
  await saveButton(page).click();
  await expect(page.getByText("Saved. We have your details")).toBeVisible();
}

export async function leadByPhone(stored: string) {
  const { data } = await database
    .from("leads")
    .select("*")
    .eq("whatsapp", stored);

  return data ?? [];
}
