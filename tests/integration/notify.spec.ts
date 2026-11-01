import { execFileSync, spawnSync } from "node:child_process";
import { expect, test } from "@playwright/test";
import { inbucketEmail } from "../../lib/notify/providers/inbucket";
import { notSent, sent } from "../../lib/notify/types";
import { processOutbox } from "../../lib/notify/worker";
import { database, startLead, uniquePhone, setOwnIp } from "../e2e/leads";

// Runs against the real local stack. Run it alone (npm run test:integration):
// the worker takes every due row in the database.

const mailViewer = "http://127.0.0.1:44324";

const runWorker = () =>
  execFileSync("node", ["scripts/notify-run.mjs"], { encoding: "utf8" });

async function mailFor(query: string) {
  const response = await fetch(
    `${mailViewer}/api/v1/search?query=${encodeURIComponent(query)}`,
  );
  const { messages } = (await response.json()) as {
    messages: { ID: string; Subject: string; To: { Address: string }[] }[];
  };
  return messages;
}

async function mailBody(id: string) {
  const response = await fetch(`${mailViewer}/api/v1/message/${id}`);
  return (await response.json()) as { Text: string; HTML: string };
}

async function createLead(
  page: Parameters<typeof startLead>[0],
  service: string,
) {
  const phone = uniquePhone();
  await setOwnIp(page);
  await startLead(page, service, phone.typed);

  const { data } = await database
    .from("leads")
    .select("id, ref")
    .eq("whatsapp", phone.stored)
    .single();

  // The owner email waits 5 seconds for step 1's answers.
  await database
    .from("notifications")
    .update({ send_after: new Date().toISOString() })
    .eq("lead_id", data!.id);

  return { ...data!, phone };
}

const rowsFor = async (leadId: string) => {
  const { data } = await database
    .from("notifications")
    .select("*")
    .eq("lead_id", leadId);
  return data!;
};

const eventsFor = async (leadId: string, type: "sms_sent" | "email_sent") => {
  const { count } = await database
    .from("lead_events")
    .select("id", { count: "exact", head: true })
    .eq("lead_id", leadId)
    .eq("type", type);
  return count;
};

// Other suites leave rows queued, and the worker takes the oldest 20 at a time.
// db:reset restarts references but not the mail viewer, so old mail can share one.
test.beforeAll(async () => {
  await database.from("notifications").delete().eq("status", "pending");
  await fetch(`${mailViewer}/api/v1/messages`, { method: "DELETE" });
});

test("a lead from /start gets one SMS and one owner email", async ({ page }) => {
  const lead = await createLead(page, "passport");

  const output = runWorker();
  expect(output).toContain("200");

  for (const row of await rowsFor(lead.id)) {
    expect(row).toMatchObject({ status: "sent", attempts: 1 });
    expect(row.sent_at).toBeTruthy();
    expect(row.provider_id).toBeTruthy();
  }
  expect(await eventsFor(lead.id, "sms_sent")).toBe(1);
  expect(await eventsFor(lead.id, "email_sent")).toBe(1);

  // The edge runtime writes its log to stderr.
  const { stderr } = spawnSync(
    "docker",
    ["logs", "--tail", "200", "supabase_edge_runtime_elc-web"],
    { encoding: "utf8" },
  );
  const smsLines = stderr
    .split("\n")
    .filter(
      (line) =>
        line.includes("[notify:sms]") &&
        line.includes(`to=${lead.phone.stored}`),
    );
  expect(smsLines).toHaveLength(1);
  expect(smsLines[0]).toContain(
    `Hi Test, thanks for contacting ErnestLinks Consult. Ref ${lead.ref}. Grace will message you on WhatsApp soon.`,
  );

  const mail = await mailFor(`subject:"${lead.ref}"`);
  expect(mail).toHaveLength(1);
  expect(mail[0].To[0].Address).toBe("grace@example.test");
  expect(mail[0].Subject).toBe(
    `New Passports & birth certificates lead: Test Lead (${lead.ref})`,
  );

  const body = await mailBody(mail[0].ID);
  expect(body.Text).toContain("Standard");
  expect(body.Text).toContain("New passport");
  expect(body.Text).toContain(`/portal/leads/${lead.id}`);
  expect(body.HTML).toContain("#0505C6");
});

test("running the worker again sends nothing twice", async ({ page }) => {
  const lead = await createLead(page, "visa");

  runWorker();
  runWorker();
  runWorker();

  expect(await mailFor(`subject:"${lead.ref}"`)).toHaveLength(1);
  expect(await eventsFor(lead.id, "sms_sent")).toBe(1);
  expect(await eventsFor(lead.id, "email_sent")).toBe(1);
});

test("two workers at once never double-send", async ({ page }) => {
  const lead = await createLead(page, "exams");
  const calls: string[] = [];
  const deps = {
    db: database,
    sms: {
      name: "count",
      send: ({ to }: { to: string }) => {
        calls.push(to);
        return Promise.resolve(sent("count"));
      },
    },
    email: inbucketEmail({ INBUCKET_URL: mailViewer }),
    siteUrl: "http://localhost:3000",
  };

  await Promise.all([processOutbox(deps), processOutbox(deps), processOutbox(deps)]);

  expect(calls).toEqual([lead.phone.stored]);
  expect(await mailFor(`subject:"${lead.ref}"`)).toHaveLength(1);
});

test("an SMS outage retries with backoff, and the owner still hears", async ({
  page,
}) => {
  const lead = await createLead(page, "school");
  const deps = {
    db: database,
    sms: {
      name: "broken",
      send: () => Promise.resolve(notSent("iSmart 503: down")),
    },
    email: inbucketEmail({ INBUCKET_URL: mailViewer }),
    siteUrl: "http://localhost:3000",
  };

  await processOutbox(deps);

  const smsRow = () =>
    rowsFor(lead.id).then((rows) => rows.find((row) => row.channel === "sms")!);
  const first = await smsRow();
  expect(first).toMatchObject({
    status: "pending",
    attempts: 1,
    last_error: "iSmart 503: down",
  });
  const waitMs = new Date(first.send_after).getTime() - Date.now();
  expect(waitMs).toBeGreaterThan(100_000);
  expect(waitMs).toBeLessThanOrEqual(120_000);

  const [ownerMail] = await mailFor(`subject:"${lead.ref}"`);
  expect(ownerMail.To[0].Address).toBe("peace@example.test");
  expect((await mailBody(ownerMail.ID)).Text).toContain(
    "has not gone through yet",
  );
  expect(await eventsFor(lead.id, "email_sent")).toBe(1);
  expect(await eventsFor(lead.id, "sms_sent")).toBe(0);

  // Five more failures, with the wait skipped each time.
  for (let attempt = 2; attempt <= 6; attempt += 1) {
    await database
      .from("notifications")
      .update({ send_after: new Date().toISOString() })
      .eq("id", first.id);
    await processOutbox(deps);
  }

  expect(await smsRow()).toMatchObject({ status: "failed", attempts: 6 });

  await processOutbox(deps);

  const failureMail = (await mailFor(`subject:"SMS failed" "${lead.ref}"`))[0];
  expect(failureMail.To[0].Address).toBe("peace@example.test");
  expect((await mailBody(failureMail.ID)).Text).toContain(
    "Please message them directly.",
  );
});

test("a contact message reaches the front desk", async () => {
  const fullName = `Esi ${Date.now()}`;
  await database.from("messages").insert({
    full_name: fullName,
    whatsapp: "+233240005001",
    topic: "Partnership",
    body: "Can we talk?",
    consent_at: new Date().toISOString(),
  });

  runWorker();

  const [mail] = await mailFor(`subject:"${fullName}"`);
  expect(mail.To[0].Address).toBe("priscilla@example.test");
  expect(mail.Subject).toBe(`New message: Partnership from ${fullName}`);
  expect((await mailBody(mail.ID)).Text).toContain("Can we talk?");
});

test("the function refuses a call without the secret", async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-notifications`,
    { method: "POST", headers: { "x-notify-secret": "wrong" } },
  );

  expect(response.status).toBe(401);
});
