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

test.each(["", "12345", "024 000 000", "+1 415 555 0100"])(
  "rejects %s",
  (number) => {
    expect(parse(number)).toBe(false);
  },
);

test("requires consent", () => {
  expect(parse("024 000 0000", false)).toBe(false);
});
