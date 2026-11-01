import { randomUUID } from "node:crypto";
import { expect, type Locator, type Page } from "@playwright/test";
import { generate } from "otplib";
import { database, uniquePhone } from "./leads";

export const password = "ELC-local-dev-2026!";

export const ids = {
  grace: "00000000-0000-4000-8000-000000000004",
  peace: "00000000-0000-4000-8000-000000000005",
};

export const emailOf = {
  frontDesk: "priscilla@example.test",
  grace: "grace@example.test",
  peace: "peace@example.test",
};

export async function signIn(page: Page, email: string, secret = password) {
  await page.goto("/portal/sign-in");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill(email);
  await page.getByLabel("Password").fill(secret);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
}

export async function signInAndWait(page: Page, email: string) {
  await signIn(page, email);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Good");
}

/** A fresh user, because TOTP enrolment changes the account for good. */
export async function createUser(role?: "admin" | "editor" | "front_desk") {
  const email = `test-${randomUUID()}@example.test`;
  const { data, error } = await database.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;

  if (role) {
    const { error: staffError } = await database.from("staff").insert({
      id: data.user.id,
      full_name: `Test ${role}`,
      title: "Test",
      role,
      email,
    });
    if (staffError) throw staffError;
  }

  return { id: data.user.id, email };
}

export async function enterCode(page: Page, secret: string) {
  await page.getByRole("textbox", { name: /6-digit code/ }).fill(await generate({ secret }));
  await page.getByRole("button", { name: "Continue" }).click();
}

/** Signs in a new admin through enrolment; returns the TOTP secret. */
export async function signInNewAdmin(page: Page) {
  const admin = await createUser("admin");

  await signIn(page, admin.email);
  await page.waitForURL("**/portal/two-step");
  const secret = (await page.getByTestId("totp-secret").textContent())!.trim();
  await enterCode(page, secret);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Good");

  return { ...admin, secret };
}

export async function createLead({
  service = "exams",
  name = `Lead ${randomUUID().slice(0, 8)}`,
  ownerId,
}: { service?: string; name?: string; ownerId?: string | null } = {}) {
  const phone = uniquePhone();
  const { data: created, error } = await database
    .rpc("create_or_attach_lead", {
      p_service: service,
      p_full_name: name,
      p_whatsapp: phone.stored,
      p_best_time: "Morning",
      p_steps_total: 3,
      p_form_version: 2,
    })
    .single();
  if (error) throw error;
  const data = created as { lead_id: string; ref: string };

  await database.rpc("save_lead_step", {
    p_lead_id: data.lead_id,
    p_step_index: 0,
    p_step_key: "start",
    p_answers: { exam: "TOEFL", need: "Both", full_name: name, consent: true },
  });

  if (ownerId !== undefined) {
    await database.from("leads").update({ owner_id: ownerId }).eq("id", data.lead_id);
  }

  return { id: data.lead_id, ref: data.ref, name, phone };
}

/** Options render in a portal, so `page` is needed when `scope` is narrower. */
export async function chooseOption(
  scope: Page | Locator,
  label: string,
  option: string,
  page = scope as Page,
) {
  await scope.getByRole("combobox", { name: label }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

export async function newestMail(to: string, subject: string) {
  const query = encodeURIComponent(`to:"${to}" subject:"${subject}"`);

  await expect
    .poll(async () => {
      const response = await fetch(`http://127.0.0.1:44324/api/v1/search?query=${query}`);
      return ((await response.json()) as { messages: unknown[] }).messages.length;
    })
    .toBeGreaterThan(0);

  const list = (await (
    await fetch(`http://127.0.0.1:44324/api/v1/search?query=${query}`)
  ).json()) as { messages: { ID: string }[] };
  const message = (await (
    await fetch(`http://127.0.0.1:44324/api/v1/message/${list.messages[0].ID}`)
  ).json()) as { HTML: string };

  return message.HTML;
}
