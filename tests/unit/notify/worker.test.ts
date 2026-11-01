import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, expect, test, vi } from "vitest";
import { processOutbox, type OutboxDeps } from "@/lib/notify/worker";
import type { Database } from "@/lib/supabase/database.types";

const row = (overrides: Record<string, unknown>) => ({
  id: "n1",
  lead_id: null,
  channel: "sms",
  to_address: "+233240000000",
  template: "sms.lead_ack",
  payload: { ref: "ELC-PP-1", first_name: "Ama", owner_first_name: "Grace" },
  attempts: 0,
  ...overrides,
});

const rpc = vi.fn();
const sms = { name: "fake", send: vi.fn() };
const email = { name: "fake", send: vi.fn() };

function deps(rows: unknown[]): OutboxDeps {
  rpc.mockImplementation((name: string) =>
    Promise.resolve(
      name === "claim_notifications"
        ? { data: rows, error: null }
        : { data: true, error: null },
    ),
  );

  const maybeSingle = () => Promise.resolve({ data: null, error: null });
  const chain = { select: () => chain, eq: () => chain, maybeSingle };

  return {
    db: { rpc, from: () => chain } as unknown as SupabaseClient<Database>,
    sms,
    email,
    siteUrl: "https://example.test",
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  sms.send.mockResolvedValue({ ok: true, providerId: "p1", error: null });
  email.send.mockResolvedValue({ ok: true, providerId: "p2", error: null });
});

test("sends a claimed row and records it", async () => {
  const result = await processOutbox(deps([row({})]));

  expect(result).toEqual({ claimed: 1, sent: 1, failed: 0 });
  expect(sms.send.mock.calls[0][0].text).toContain("Hi Ama,");
  expect(rpc).toHaveBeenCalledWith("record_notification_sent", {
    p_id: "n1",
    p_provider_id: "p1",
  });
});

test("claims at most 20 at a time", async () => {
  await processOutbox(deps([]));

  expect(rpc).toHaveBeenCalledWith("claim_notifications", { p_limit: 20 });
});

test("a failed send records the error and the backoff", async () => {
  sms.send.mockResolvedValue({ ok: false, providerId: null, error: "Down" });

  const result = await processOutbox(deps([row({ attempts: 2 })]));

  expect(result).toEqual({ claimed: 1, sent: 0, failed: 1 });
  expect(rpc).toHaveBeenCalledWith("record_notification_failure", {
    p_id: "n1",
    p_error: "Down",
    p_retry_minutes: 8,
  });
});

test("a provider that throws does not stop the batch", async () => {
  sms.send.mockRejectedValueOnce(new Error("Socket closed"));

  const result = await processOutbox(
    deps([row({ id: "n1" }), row({ id: "n2" })]),
  );

  expect(result).toEqual({ claimed: 2, sent: 1, failed: 1 });
  expect(rpc).toHaveBeenCalledWith(
    "record_notification_failure",
    expect.objectContaining({ p_id: "n1", p_error: "Socket closed" }),
  );
});

test("an unknown template counts as a failure", async () => {
  await processOutbox(deps([row({ template: "nope" })]));

  expect(sms.send).not.toHaveBeenCalled();
  expect(rpc).toHaveBeenCalledWith(
    "record_notification_failure",
    expect.objectContaining({ p_error: "Unknown template: nope" }),
  );
});

test("SMS goes before email, so the owner email can report it", async () => {
  const order: string[] = [];
  sms.send.mockImplementation(() => {
    order.push("sms");
    return Promise.resolve({ ok: true, providerId: "p1", error: null });
  });
  email.send.mockImplementation(() => {
    order.push("email");
    return Promise.resolve({ ok: true, providerId: "p2", error: null });
  });

  await processOutbox(
    deps([
      row({
        id: "e1",
        channel: "email",
        template: "email.message_received",
        payload: { full_name: "Esi", whatsapp: "+233240000000", body: "Hi" },
      }),
      row({ id: "s1" }),
    ]),
  );

  expect(order).toEqual(["sms", "email"]);
});

test("the contact email goes to the address on the row", async () => {
  await processOutbox(
    deps([
      row({
        channel: "email",
        to_address: "desk@example.test",
        template: "email.message_received",
        payload: { full_name: "Esi", whatsapp: "+233240000000", body: "Hi" },
      }),
    ]),
  );

  expect(email.send.mock.calls[0][0].to).toBe("desk@example.test");
});
