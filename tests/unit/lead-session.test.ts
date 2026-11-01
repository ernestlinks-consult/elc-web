import { afterEach, beforeEach, expect, test, vi } from "vitest";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));

const { decodeLeadSession, encodeLeadSession } = await import(
  "@/lib/leads/session"
);

const leadId = "11111111-1111-4111-8111-111111111111";
const future = Date.now() + 60_000;

beforeEach(() => {
  vi.stubEnv("LEAD_SESSION_SECRET", "test-secret");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

test("a signed value returns the lead", () => {
  expect(decodeLeadSession(encodeLeadSession(leadId, future))).toBe(leadId);
});

test("an expired value is refused", () => {
  expect(decodeLeadSession(encodeLeadSession(leadId, Date.now() - 1))).toBeNull();
});

test("a value with another lead id is refused", () => {
  const value = encodeLeadSession(leadId, future);

  expect(
    decodeLeadSession(value.replace(leadId, "22222222-2222-4222-8222-222222222222")),
  ).toBeNull();
});

test("a longer expiry is refused", () => {
  const value = encodeLeadSession(leadId, future);

  expect(decodeLeadSession(value.replace(String(future), String(future + 1)))).toBeNull();
});

test("a value signed with another secret is refused", () => {
  const value = encodeLeadSession(leadId, future);
  vi.stubEnv("LEAD_SESSION_SECRET", "another-secret");

  expect(decodeLeadSession(value)).toBeNull();
});

test.each([undefined, "", "nonsense", `${leadId}.1`, "a.b.c.d"])(
  "%j is refused",
  (value) => {
    expect(decodeLeadSession(value)).toBeNull();
  },
);

test("no secret is a loud failure, not an unsigned cookie", () => {
  vi.stubEnv("LEAD_SESSION_SECRET", "");

  expect(() => encodeLeadSession(leadId, future)).toThrow(
    "LEAD_SESSION_SECRET",
  );
});
