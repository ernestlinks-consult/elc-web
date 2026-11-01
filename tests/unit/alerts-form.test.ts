import { expect, test } from "vitest";
import { alertsSchema } from "@/lib/forms/alerts";

const parse = (whatsapp: string, consent = true) =>
  alertsSchema.safeParse({ whatsapp, consent }).success;

test.each(["024 000 0000", "0240000000", "+233 24 000 0000", "233240000000"])(
  "accepts %s",
  (number) => {
    expect(parse(number)).toBe(true);
  },
);

test("stores the number in international form", () => {
  expect(alertsSchema.parse({ whatsapp: "024 000 0000", consent: true }).whatsapp).toBe(
    "+233240000000",
  );
});

test("accepts an international number", () => {
  expect(alertsSchema.parse({ whatsapp: "+44 7911 123456", consent: true }).whatsapp).toBe(
    "+447911123456",
  );
});

test.each(["", "12345", "024 000 000"])(
  "rejects %s",
  (number) => {
    expect(parse(number)).toBe(false);
  },
);

test("requires consent", () => {
  expect(parse("024 000 0000", false)).toBe(false);
});
