import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { intakePattern, nextIntakes } from "@/lib/forms/intakes";
import { serviceForms } from "@/lib/forms";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test.each([
  ["2026-11-02T10:00:00Z", ["Jan 2027", "May 2027", "Sep 2027", "Jan 2028", "May 2028", "Sep 2028"]],
  ["2027-01-15T10:00:00Z", ["May 2027", "Sep 2027", "Jan 2028", "May 2028", "Sep 2028", "Jan 2029"]],
  ["2027-05-01T00:00:00Z", ["Sep 2027", "Jan 2028", "May 2028", "Sep 2028", "Jan 2029", "May 2029"]],
  ["2027-08-31T23:59:59Z", ["Sep 2027", "Jan 2028", "May 2028", "Sep 2028", "Jan 2029", "May 2029"]],
  ["2027-12-31T23:59:59Z", ["Jan 2028", "May 2028", "Sep 2028", "Jan 2029", "May 2029", "Sep 2029"]],
])("from %s", (now, expected) => {
  vi.setSystemTime(new Date(now));

  expect(nextIntakes(new Date())).toEqual(expected);
});

test("always six, and every one passes validation for years ahead", () => {
  for (let year = 2026; year < 2060; year += 1) {
    const intakes = nextIntakes(new Date(`${year}-06-15T12:00:00Z`));

    expect(intakes).toHaveLength(6);
    for (const intake of intakes) expect(intake).toMatch(intakePattern);
  }
});

test("the school form has no year written into it", () => {
  const field = JSON.stringify(serviceForms.school.steps[0].fields);

  expect(field).not.toMatch(/20\d\d/);
});

test("the school form accepts a generated intake and refuses anything else", () => {
  const step = serviceForms.school.steps[0];
  const base = {
    full_name: "Ama",
    whatsapp: "0240000000",
    level: "PhD",
    best_time: "Morning",
    consent: true,
  };

  expect(step.schema.safeParse({ ...base, start_intake: "May 2031" }).success).toBe(true);
  expect(step.schema.safeParse({ ...base, start_intake: "Not sure" }).success).toBe(true);
  expect(step.schema.safeParse({ ...base, start_intake: "June 2031" }).success).toBe(false);
});
