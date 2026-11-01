import { execFileSync, spawnSync } from "node:child_process";
import { expect, test, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { database, fillStepOne, saveButton, setOwnIp, uniquePhone } from "./leads";
import {
  chooseOption,
  createLead,
  createUser,
  emailOf,
  enterCode,
  ids,
  newestMail,
  password,
  signIn,
  signInAndWait,
  signInNewAdmin,
} from "./portal-helpers";
import {
  desktop,
  expectNoAxeViolations,
  expectNoHorizontalOverflow,
  phone,
} from "./shell";

const expectToast = (page: Page, text: string) =>
  expect(page.locator("li").getByText(text, { exact: true })).toBeVisible();

const failedMessage = "That email and password didn't work.";

test.describe("signing in", () => {
  test("/portal sends a visitor to sign-in and back after", async ({ page }) => {
    await page.goto("/portal/leads?status=new");
    await page.waitForURL("**/portal/sign-in?next=*");

    await page.getByRole("textbox", { name: "Email", exact: true }).fill(emailOf.frontDesk);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    await page.waitForURL("**/portal/leads?status=new");
  });

  for (const path of [
    "/portal",
    "/portal/leads",
    "/portal/leads/11111111-1111-4111-8111-111111111111",
    "/portal/messages",
    "/portal/subscribers",
    "/portal/export/leads",
    "/portal/export/subscribers",
  ]) {
    test(`${path} redirects with no session`, async ({ request }) => {
      const response = await request.get(path, { maxRedirects: 0 });

      expect(response.status()).toBe(307);
      expect(response.headers().location).toContain("/portal/sign-in");
    });
  }

  test("the error is the same for a bad password and an unknown email", async ({
    page,
  }) => {
    await signIn(page, emailOf.grace, "wrong-password");
    await expect(page.getByRole("main").getByText(failedMessage)).toBeVisible();

    await signIn(page, "nobody@example.test", "wrong-password");
    await expect(page.getByRole("main").getByText(failedMessage)).toBeVisible();
  });

  test("Supabase refuses a sign-up, whatever the page offers", async () => {
    const { error } = await createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    ).auth.signUp({ email: "stranger@example.test", password: "a-long-password-1" });

    expect(error?.message).toMatch(/not allowed|disabled/i);
  });

  test("there is no way to sign up", async ({ page }) => {
    await page.goto("/portal/sign-in");

    await expect(page.getByRole("main").getByText(/sign up|create an account|register/i)).toHaveCount(0);
  });

  test("portal responses are private", async ({ page, request }) => {
    const signInPage = await request.get("/portal/sign-in");
    expect(signInPage.headers()["cache-control"]).toContain("no-store");
    expect(signInPage.headers()["x-robots-tag"]).toContain("noindex");
    expect(signInPage.headers()["content-security-policy"]).toContain(
      "frame-ancestors 'none'",
    );

    await signInAndWait(page, emailOf.frontDesk);
    const inbox = await page.goto("/portal/leads");
    const headers = inbox!.headers();
    expect(headers["cache-control"]).toContain("no-store");
    expect(headers["x-robots-tag"]).toContain("noindex");
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  });

  test("session cookies cannot be read by scripts", async ({ page, context }) => {
    await signInAndWait(page, emailOf.grace);

    const auth = (await context.cookies()).filter(({ name }) =>
      name.includes("auth-token"),
    );
    expect(auth.length).toBeGreaterThan(0);
    for (const cookie of auth) {
      expect(cookie).toMatchObject({ httpOnly: true, sameSite: "Lax" });
    }
    expect(await page.evaluate(() => document.cookie)).not.toContain("auth-token");
  });

  test("an emailed link signs staff in", async ({ page }) => {
    const user = await createUser("editor");
    await page.goto("/portal/sign-in");
    await page.getByRole("textbox", { name: "Email for a sign-in link" }).fill(user.email);
    await page.getByRole("button", { name: "Email me a sign-in link" }).click();
    await expect(page.getByRole("main").getByText("If that email belongs to a staff account")).toBeVisible();

    const html = await newestMail(user.email, "Your ELC portal sign-in link");
    const link = html.match(/href="([^"]+portal\/auth\/confirm[^"]+)"/)![1];

    await page.goto(link.replaceAll("&amp;", "&"));
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Good");
  });

  test("a link request says the same for an unknown email", async ({ page }) => {
    await page.goto("/portal/sign-in");
    await page
      .getByRole("textbox", { name: "Email for a sign-in link" })
      .fill("nobody@example.test");
    await page.getByRole("button", { name: "Email me a sign-in link" }).click();

    await expect(page.getByRole("main").getByText("If that email belongs to a staff account")).toBeVisible();
    const { data } = await database.auth.admin.listUsers();
    expect(data.users.some(({ email }) => email === "nobody@example.test")).toBe(false);
  });

  test("a used or bad link explains itself", async ({ page }) => {
    await page.goto("/portal/auth/confirm?token_hash=bad&type=magiclink");

    await expect(page.getByRole("main").getByText("That link has expired")).toBeVisible();
  });

  test("sign out ends the session", async ({ page }) => {
    await signInAndWait(page, emailOf.grace);
    await page.getByRole("button", { name: "Sign out" }).click();
    await page.waitForURL("**/portal/sign-in");

    await page.goto("/portal/leads");
    await page.waitForURL("**/portal/sign-in?next=*");
  });

  test("a signed-in non-staff user gets the no access page", async ({ page }) => {
    const user = await createUser();
    await signIn(page, user.email);

    await page.waitForURL("**/portal/no-access");
    await expect(page.getByRole("heading", { name: "No access" })).toBeVisible();

    await page.goto("/portal/leads");
    await page.waitForURL("**/portal/no-access");
    await expectNoAxeViolations(page);
  });

  test("disabling staff signs them out on the next request", async ({ page }) => {
    const user = await createUser("editor");
    await signIn(page, user.email);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Good");

    await database.from("staff").update({ is_active: false }).eq("id", user.id);

    await page.goto("/portal/leads");
    await page.waitForURL("**/portal/sign-in?blocked=1");
    await expect(page.getByRole("main").getByText("This account can't sign in.")).toBeVisible();

    await signIn(page, user.email);
    await page.waitForURL("**/portal/sign-in?blocked=1");
  });
});

test("staff:invite sends an invite that ends in a working account", async ({ page }) => {
  const email = `invite-${Date.now()}@example.test`;

  const output = execFileSync(
    "node",
    [
      "scripts/staff-invite.mjs",
      "--email", email,
      "--name", "Invited Person",
      "--role", "editor",
      "--title", "Tester",
      "--content", "faq,post",
    ],
    { encoding: "utf8" },
  );
  expect(output).toContain("Invited Invited Person");

  const { data: staff } = await database
    .from("staff")
    .select("id, role, show_on_site, staff_content_access (content_type)")
    .eq("email", email)
    .single();
  expect(staff).toMatchObject({ role: "editor", show_on_site: false });
  expect(staff!.staff_content_access.map((row) => row.content_type).sort()).toEqual([
    "faq",
    "post",
  ]);

  const html = await newestMail(email, "Your ELC staff portal invitation");
  const link = html.match(/href="([^"]+portal\/auth\/confirm[^"]+)"/)![1];

  await page.goto(link.replaceAll("&amp;", "&"));
  await page.waitForURL("**/portal/set-password");
  await page.getByLabel("New password").fill("short");
  await page.getByRole("button", { name: "Save password" }).click();
  await expect(page.getByRole("main").getByText("Use at least 12 characters.")).toBeVisible();

  await page.getByLabel("New password").fill("a-much-longer-password");
  await page.getByRole("button", { name: "Save password" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Good");

  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL("**/portal/sign-in");
  await signIn(page, email, "a-much-longer-password");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Good");
});

test("staff:invite refuses a bad role and creates nothing", () => {
  const result = spawnSync(
    "node",
    ["scripts/staff-invite.mjs", "--email", "x@example.test", "--name", "X", "--role", "owner"],
    { encoding: "utf8" },
  );

  expect(result.status).toBe(1);
  expect(result.stderr).toContain("--role must be one of");
});

test.describe("two-step sign-in", () => {
  test("first sign-in enrols, later ones ask for a code", async ({ page, context }) => {
    const admin = await signInNewAdmin(page);
    await expect(page.getByRole("complementary")).toContainText("Admin");

    await page.getByRole("button", { name: "Sign out" }).click();
    await page.waitForURL("**/portal/sign-in");
    await context.clearCookies();

    await signIn(page, admin.email);
    await page.waitForURL("**/portal/two-step");
    await expect(page.getByAltText("QR code for your authenticator app")).toHaveCount(0);

    await page.getByRole("textbox", { name: /6-digit code/ }).fill("000000");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("main").getByText("That code didn't work.")).toBeVisible();

    await enterCode(page, admin.secret);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Good");
  });

  test("enrolment shows a QR code and a setup key", async ({ page }) => {
    const admin = await createUser("admin");
    await signIn(page, admin.email);
    await page.waitForURL("**/portal/two-step");

    await expect(page.getByAltText("QR code for your authenticator app")).toBeVisible();
    await expect(page.getByTestId("totp-secret")).toHaveText(/^[A-Z2-7]{16,}$/);
    await expectNoAxeViolations(page);
  });

  test("an admin cannot skip the second step", async ({ page }) => {
    const admin = await createUser("admin");
    await signIn(page, admin.email);
    await page.waitForURL("**/portal/two-step");

    for (const path of ["/portal", "/portal/leads", "/portal/messages"]) {
      await page.goto(path);
      await page.waitForURL("**/portal/two-step");
    }

    const response = await page.request.get("/portal/export/leads", { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(response.headers().location).toContain("/portal/two-step");
  });

  test("other roles are not asked", async ({ page }) => {
    await signInAndWait(page, emailOf.frontDesk);

    expect(page.url()).not.toContain("two-step");
  });
});

test.describe("what each role sees", () => {
  test("front desk sees everything in the sidebar and all leads", async ({ page }) => {
    const lead = await createLead({ ownerId: ids.peace });
    await signInAndWait(page, emailOf.frontDesk);

    const nav = page.getByRole("navigation", { name: "Portal" });
    await expect(nav.getByRole("link", { name: "Messages" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Subscribers" })).toBeVisible();
    await expect(page.getByRole("complementary")).toContainText("Front desk");

    await page.goto(`/portal/leads?q=${encodeURIComponent(lead.ref)}`);
    await expect(page.getByRole("link", { name: lead.name })).toBeVisible();
    await expect(page.getByRole("link", { name: "Export CSV" })).toHaveCount(0);
  });

  test("an editor sees only their own leads, and Mine by default", async ({ page }) => {
    const own = await createLead({ ownerId: ids.grace });
    const other = await createLead({ ownerId: ids.peace });
    await signInAndWait(page, emailOf.grace);

    const nav = page.getByRole("navigation", { name: "Portal" });
    await expect(nav.getByRole("link", { name: "Messages" })).toHaveCount(0);
    await expect(nav.getByRole("link", { name: "Subscribers" })).toHaveCount(0);

    await page.goto("/portal/leads");
    await expect(page.getByRole("link", { name: own.name })).toBeVisible();

    await page.goto(`/portal/leads?owner=all&q=${encodeURIComponent(other.ref)}`);
    await expect(page.getByRole("main").getByText("No leads match these filters.")).toBeVisible();
  });

  test("an editor opening another's lead by URL gets not found", async ({ page }) => {
    const other = await createLead({ ownerId: ids.peace });
    await signInAndWait(page, emailOf.grace);

    await page.goto(`/portal/leads/${other.id}`);

    await expect(page.getByRole("heading", { name: "Not found" })).toBeVisible();
    await expect(page.getByRole("main").getByText(other.name)).toHaveCount(0);
  });

  test("an editor is kept out of messages and subscribers", async ({ page }) => {
    await signInAndWait(page, emailOf.grace);

    await page.goto("/portal/messages");
    await page.waitForURL(/\/portal$/);
    await page.goto("/portal/subscribers");
    await page.waitForURL(/\/portal$/);

    const response = await page.request.get("/portal/export/subscribers");
    expect(response.status()).toBe(403);
  });

  test("an editor cannot change owner or resend", async ({ page }) => {
    const own = await createLead({ ownerId: ids.grace });
    await signInAndWait(page, emailOf.grace);
    await page.goto(`/portal/leads/${own.id}`);

    await expect(page.getByRole("combobox", { name: "Status" })).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Owner" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Resend acknowledgement SMS" })).toHaveCount(0);
  });

  test("a bad lead id is not found, not an error", async ({ page }) => {
    await signInAndWait(page, emailOf.frontDesk);

    await page.goto("/portal/leads/not-a-real-id");

    await expect(page.getByRole("heading", { name: "Not found" })).toBeVisible();
  });
});

test.describe("working a lead", () => {
  test("front desk assigns a lead and changes its status", async ({ page }) => {
    const lead = await createLead({ ownerId: null });
    await signInAndWait(page, emailOf.frontDesk);
    await page.goto(`/portal/leads/${lead.id}`);

    await chooseOption(page, "Owner", "Grace Y.");
    await expectToast(page, "Owner changed.");

    await chooseOption(page, "Status", "Contacted");
    await expectToast(page, "Status changed to Contacted.");

    const timeline = page.getByRole("list", { name: "Timeline" });
    await expect(timeline).toContainText("Assigned to Grace Y.");
    await expect(timeline).toContainText("Status changed: New to Contacted");
    await expect(timeline).toContainText("Priscilla A.");

    const { data } = await database
      .from("leads")
      .select("owner_id, status, first_reply_at")
      .eq("id", lead.id)
      .single();
    expect(data).toMatchObject({ owner_id: ids.grace, status: "contacted" });
    expect(data!.first_reply_at).toBeTruthy();
  });

  test("closing needs a reason", async ({ page }) => {
    const lead = await createLead({ ownerId: ids.grace });
    await signInAndWait(page, emailOf.frontDesk);
    await page.goto(`/portal/leads/${lead.id}`);

    await chooseOption(page, "Status", "Closed");
    const dialog = page.getByRole("dialog", { name: "Close this lead" });
    await dialog.getByRole("button", { name: "Close lead" }).click();
    await expect(dialog.getByText("Give a reason for closing this lead.")).toBeVisible();

    await dialog.getByRole("textbox", { name: "Reason" }).fill("Booked elsewhere");
    await dialog.getByRole("button", { name: "Close lead" }).click();

    await expectToast(page, "Lead closed.");
    await expect(page.getByRole("main").getByText("Booked elsewhere")).toBeVisible();

    const { data } = await database
      .from("leads")
      .select("status, closed_reason")
      .eq("id", lead.id)
      .single();
    expect(data).toEqual({ status: "closed", closed_reason: "Booked elsewhere" });
  });

  test("cancelling the close dialog changes nothing and returns focus", async ({
    page,
  }) => {
    const lead = await createLead({ ownerId: ids.grace });
    await signInAndWait(page, emailOf.frontDesk);
    await page.goto(`/portal/leads/${lead.id}`);

    await chooseOption(page, "Status", "Closed");
    await page.getByRole("dialog").getByRole("button", { name: "Cancel" }).click();

    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("combobox", { name: "Status" })).toHaveText(/New/);
  });

  test("a note appears in the timeline with who wrote it", async ({ page }) => {
    const lead = await createLead({ ownerId: ids.grace });
    await signInAndWait(page, emailOf.grace);
    await page.goto(`/portal/leads/${lead.id}`);

    await page.getByRole("textbox", { name: "Add a note" }).fill("Called, will bring documents");
    await page.getByRole("button", { name: "Save note" }).click();

    const timeline = page.getByRole("list", { name: "Timeline" });
    await expect(timeline).toContainText("Called, will bring documents");
    await expect(timeline).toContainText("Grace Y.");
  });

  test("resend queues a new notification", async ({ page }) => {
    const lead = await createLead({ ownerId: ids.grace });
    await database
      .from("notifications")
      .update({ status: "sent" })
      .eq("lead_id", lead.id)
      .eq("template", "sms.lead_ack");
    await signInAndWait(page, emailOf.frontDesk);
    await page.goto(`/portal/leads/${lead.id}`);

    await page.getByRole("button", { name: "Resend acknowledgement SMS" }).click();
    await expectToast(page, "Acknowledgement SMS queued.");

    const { data } = await database
      .from("notifications")
      .select("status")
      .eq("lead_id", lead.id)
      .eq("template", "sms.lead_ack")
      .order("created_at");
    expect(data!.map(({ status }) => status).sort()).toEqual(["pending", "sent"]);

    await page.getByRole("button", { name: "Resend acknowledgement SMS" }).click();
    await expectToast(page, "An SMS is already waiting to go out.");
  });

  test("the lead page shows answers, links and message status", async ({ page }) => {
    const lead = await createLead({ ownerId: ids.grace });
    await signInAndWait(page, emailOf.grace);
    await page.goto(`/portal/leads/${lead.id}`);

    await expect(page.getByRole("main").getByText("TOEFL")).toBeVisible();
    await expect(page.getByRole("link", { name: "Call" })).toHaveAttribute(
      "href",
      `tel:${lead.phone.stored}`,
    );
    await expect(page.getByRole("link", { name: /^WhatsApp/ })).toHaveAttribute(
      "href",
      new RegExp(`this%20is%20Grace.*${lead.ref}`),
    );
    await expect(page.getByRole("main").getByText("Acknowledgement SMS", { exact: true })).toBeVisible();
    await expect(page.getByRole("main").getByText("pending").first()).toBeVisible();
  });

  test("earlier submissions stay available behind a toggle", async ({ page }) => {
    const lead = await createLead({ ownerId: ids.grace, name: "First Person" });
    await database.rpc("create_or_attach_lead", {
      p_service: "exams",
      p_full_name: "Second Person",
      p_whatsapp: lead.phone.stored,
      p_best_time: "Morning",
      p_steps_total: 3,
      p_form_version: 2,
    });
    await database.rpc("save_lead_step", {
      p_lead_id: lead.id,
      p_submission: 2,
      p_step_index: 0,
      p_step_key: "start",
      p_answers: { exam: "GRE" },
    });
    await signInAndWait(page, emailOf.grace);
    await page.goto(`/portal/leads/${lead.id}`);

    await expect(page.getByRole("main").getByText("GRE")).toBeVisible();
    await expect(page.getByRole("main").getByText("TOEFL")).toBeHidden();

    await page.getByRole("main").getByText("Earlier submission").click();
    await expect(page.getByRole("main").getByText("TOEFL")).toBeVisible();
    await expect(page.getByRole("list", { name: "Timeline" })).toContainText(
      "Submitted again from another session",
    );
  });

  test("the full journey: visitor to front desk to Grace", async ({ page, browser }) => {
    const visitor = await browser.newContext();
    const form = await visitor.newPage();
    const number = uniquePhone();
    const name = `Journey ${Date.now()}`;
    await setOwnIp(form);
    await form.goto("/start?service=travel");
    await fillStepOne(form, "travel", number.typed, name);
    await saveButton(form).click();
    await expect(form.getByText("Saved. We have your details")).toBeVisible();
    await visitor.close();

    await signInAndWait(page, emailOf.frontDesk);
    await page.goto("/portal/leads?status=new");
    await page.getByRole("link", { name, exact: true }).click();
    await chooseOption(page.getByRole("complementary", { name: "Lead details" }), "Owner", "Grace Y.", page);
    await expectToast(page, "Owner changed.");

    const grace = await browser.newContext();
    const gracePage = await grace.newPage();
    await signInAndWait(gracePage, emailOf.grace);
    await gracePage.goto("/portal/leads");
    await expect(gracePage.getByRole("link", { name, exact: true })).toBeVisible();
    await grace.close();
  });
});

test.describe("the inbox", () => {
  test("search finds a lead by name, phone in any format, and reference", async ({
    page,
  }) => {
    const lead = await createLead();
    await signInAndWait(page, emailOf.frontDesk);

    for (const term of [lead.name, lead.ref, lead.phone.typed]) {
      await page.goto("/portal/leads");
      await page.getByRole("searchbox", { name: "Search" }).fill(term);
      await page.getByRole("button", { name: "Search" }).click();

      await expect(page.getByRole("link", { name: lead.name })).toBeVisible();
    }
  });

  test("status tabs show counts and filter", async ({ page }) => {
    const lead = await createLead();
    await database.from("leads").update({ status: "paid" }).eq("id", lead.id);
    await signInAndWait(page, emailOf.frontDesk);
    await page.goto(`/portal/leads?q=${encodeURIComponent(lead.ref)}`);

    const tabs = page.getByRole("navigation", { name: "Lead status" });
    await expect(tabs.getByRole("link", { name: "Paid 1" })).toBeVisible();
    await expect(tabs.getByRole("link", { name: "New 0" })).toBeVisible();

    await tabs.getByRole("link", { name: "New 0" }).click();
    await expect(page.getByRole("main").getByText("No leads match these filters.")).toBeVisible();
  });

  test("the service filter works", async ({ page }) => {
    const lead = await createLead({ service: "visa" });
    await signInAndWait(page, emailOf.frontDesk);
    await page.goto(`/portal/leads?q=${encodeURIComponent(lead.ref)}`);

    await chooseOption(page, "Service", "Travel & tours");
    await expect(page.getByRole("main").getByText("No leads match these filters.")).toBeVisible();

    await chooseOption(page, "Service", "Visa applications");
    await expect(page.getByRole("link", { name: lead.name })).toBeVisible();
  });

  test("a lead past the reply promise is flagged, and the dashboard agrees", async ({
    page,
  }) => {
    const lead = await createLead({ ownerId: ids.grace });
    await database
      .from("leads")
      .update({ created_at: "2026-01-05T09:00:00Z" })
      .eq("id", lead.id);
    await signInAndWait(page, emailOf.grace);

    const kpi = page.getByRole("main").getByText("Overdue", { exact: true }).first();
    await expect(kpi).toBeVisible();

    await page.goto(`/portal/leads?q=${encodeURIComponent(lead.ref)}`);
    await expect(page.getByRole("main").locator("table").getByText("Overdue")).toBeVisible();

    await database.from("leads").update({ status: "closed", closed_reason: "Test" }).eq("id", lead.id);
  });

  test("a wide screen opens the side panel", async ({ page }) => {
    const lead = await createLead({ ownerId: ids.grace });
    await signInAndWait(page, emailOf.grace);
    await page.goto(`/portal/leads?q=${encodeURIComponent(lead.ref)}`);

    await page.getByRole("link", { name: lead.name }).click();

    const panel = page.getByRole("complementary", { name: "Lead details" });
    await expect(panel.getByRole("heading", { name: lead.name })).toBeVisible();
  });

  test("an admin exports the filtered leads, and it is logged", async ({ page }) => {
    const lead = await createLead({ name: "=Formula Lead" });
    const admin = await signInNewAdmin(page);

    const response = await page.request.get(
      `/portal/export/leads?owner=all&q=${encodeURIComponent(lead.ref)}`,
    );
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("text/csv");
    const csv = await response.text();
    expect(csv).toContain(lead.ref);
    expect(csv).toContain("'=Formula Lead");
    expect(csv.trim().split("\r\n")).toHaveLength(2);

    const { data } = await database
      .from("audit_log")
      .select("action, table_name")
      .eq("actor_id", admin.id)
      .eq("action", "export");
    expect(data).toEqual([{ action: "export", table_name: "leads" }]);
  });

  test("viewing the inbox never triggers an export", async ({ page }) => {
    const admin = await signInNewAdmin(page);
    await page.goto("/portal/leads");
    await expect(page.getByRole("link", { name: "Export CSV" })).toBeVisible();
    await page.waitForLoadState("networkidle");

    const { count } = await database
      .from("audit_log")
      .select("id", { count: "exact", head: true })
      .eq("actor_id", admin.id)
      .eq("action", "export");
    expect(count).toBe(0);
  });

  test("front desk cannot export leads", async ({ page }) => {
    await signInAndWait(page, emailOf.frontDesk);

    const response = await page.request.get("/portal/export/leads");

    expect(response.status()).toBe(403);
  });

  test("portal inputs use the smaller radius", async ({ page }) => {
    await signInAndWait(page, emailOf.frontDesk);
    await page.goto("/portal/leads");

    await expect(page.getByRole("searchbox", { name: "Search" })).toHaveCSS(
      "border-radius",
      "10px",
    );
  });
});

test.describe("messages and subscribers", () => {
  test("front desk assigns a message and marks it handled", async ({ page }) => {
    const name = `Sender ${Date.now()}`;
    await database.from("messages").insert({
      full_name: name,
      whatsapp: uniquePhone().stored,
      topic: "Partnership",
      body: "Can we talk?",
      consent_at: new Date().toISOString(),
    });
    await signInAndWait(page, emailOf.frontDesk);
    await page.goto("/portal/messages");

    await expect(page.getByRole("heading", { name })).toBeVisible();
    await chooseOption(page, `Assign ${name}`, "Grace Y.");
    await expectToast(page, "Message assigned.");

    await page.getByRole("button", { name: `Mark handled: ${name}` }).click();
    await expectToast(page, "Message marked handled.");
    await expect(page.getByRole("heading", { name })).toHaveCount(0);

    await page.goto("/portal/messages?status=handled");
    await expect(page.getByRole("heading", { name })).toBeVisible();
    await expect(page.getByRole("combobox", { name: `Assign ${name}` })).toHaveText(/Grace Y\./);
  });

  test("front desk unsubscribes a number and exports the list", async ({ page }) => {
    const number = uniquePhone().stored;
    await database.from("subscribers").insert({
      whatsapp: number,
      consent_at: new Date().toISOString(),
    });
    await signInAndWait(page, emailOf.frontDesk);
    await page.goto("/portal/subscribers");

    await page.getByRole("button", { name: `Unsubscribe ${number}` }).click();
    await expectToast(page, "Number unsubscribed.");

    await page.goto("/portal/subscribers?filter=unsubscribed");
    await expect(page.getByRole("main").getByText(number)).toBeVisible();
    await expect(page.getByRole("button", { name: `Unsubscribe ${number}` })).toHaveCount(0);

    const { count } = await database
      .from("subscribers_active")
      .select("id", { count: "exact", head: true })
      .eq("whatsapp", number);
    expect(count).toBe(0);

    const response = await page.request.get("/portal/export/subscribers");
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain(number.slice(1));
  });
});

for (const [name, viewport] of Object.entries({ desktop, phone })) {
  test.describe(`accessibility on ${name}`, () => {
    test.use({ viewport });

    test("sign-in has no axe violations", async ({ page }) => {
      await page.goto("/portal/sign-in");
      await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();

      await expectNoAxeViolations(page);
    });

    test("the working pages have no axe violations and do not overflow", async ({
      page,
    }) => {
      const lead = await createLead({ ownerId: ids.grace });
      await database.from("messages").insert({
        full_name: "Axe Sender",
        whatsapp: uniquePhone().stored,
        body: "Hello",
        consent_at: new Date().toISOString(),
      });
      await database.from("subscribers").insert({
        whatsapp: uniquePhone().stored,
        consent_at: new Date().toISOString(),
      });
      await signIn(page, emailOf.frontDesk);
      await page.waitForURL(/\/portal$/);

      for (const path of [
        "/portal",
        "/portal/leads",
        `/portal/leads/${lead.id}`,
        "/portal/messages",
        "/portal/subscribers",
      ]) {
        await page.goto(path);
        await expect(page.getByRole("heading").first()).toBeVisible();
        await expectNoAxeViolations(page);
      }
    });
  });
}

test("no horizontal overflow from 320px to 1600px", async ({ page }) => {
  await signIn(page, emailOf.frontDesk);
  await page.waitForURL(/\/portal$/);

  for (const path of ["/portal", "/portal/leads"]) {
    await page.goto(path);
    await expectNoHorizontalOverflow(page);
  }
});

test("sign-in has no horizontal overflow", async ({ page }) => {
  await page.goto("/portal/sign-in");

  await expectNoHorizontalOverflow(page);
});

test.describe("on a phone", () => {
  test.use({ viewport: phone });

  test("the sidebar becomes a top bar with a menu, and focus returns", async ({ page }) => {
    await signIn(page, emailOf.frontDesk);
    await page.waitForURL(/\/portal$/);

    const menu = page.getByRole("button", { name: "Menu" });
    await menu.click();
    const dialog = page.getByRole("dialog", { name: "Menu" });
    await expect(dialog.getByRole("link", { name: "Subscribers" })).toBeVisible();
    await expect(dialog).toContainText("Priscilla A.");

    await page.keyboard.press("Escape");
    await expect(menu).toBeFocused();

    await menu.click();
    await dialog.getByRole("link", { name: "Leads" }).click();
    await page.waitForURL("**/portal/leads");
  });

  test("leads are a card list, not a table", async ({ page }) => {
    const lead = await createLead();
    await signIn(page, emailOf.frontDesk);
    await page.waitForURL(/\/portal$/);
    await page.goto(`/portal/leads?q=${encodeURIComponent(lead.ref)}`);

    await expect(page.getByRole("main").locator("table")).toBeHidden();
    await expect(page.getByRole("list", { name: "Leads" })).toContainText(lead.ref);
  });
});
