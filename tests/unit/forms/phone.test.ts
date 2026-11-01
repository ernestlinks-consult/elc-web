import { expect, test } from "vitest";
import { normalizePhone } from "@/lib/forms/phone";

test.each([
  ["0240000000", "+233240000000"],
  ["024 000 0000", "+233240000000"],
  ["024-000-0000", "+233240000000"],
  ["+233240000000", "+233240000000"],
  ["+233 24 000 0000", "+233240000000"],
  ["  053 778 3166 ", "+233537783166"],
])("normalises the Ghana number %s", (input, expected) => {
  expect(normalizePhone(input)).toBe(expected);
});

test.each([
  ["+44 7911 123456", "+447911123456"],
  ["+1 202 555 0143", "+12025550143"],
  ["+234 803 123 4567", "+2348031234567"],
  ["+49 170 1234567", "+491701234567"],
])("normalises the international number %s", (input, expected) => {
  expect(normalizePhone(input)).toBe(expected);
});

test.each(["", "12345", "024 000 000", "024 000 00000", "abcdefghij", "+44 12"])(
  "rejects %j",
  (input) => {
    expect(normalizePhone(input)).toBeNull();
  },
);

test("a foreign number in a range the library does not know is still accepted", () => {
  expect(normalizePhone("+44 7911 300097")).toBe("+447911300097");
});

test("Ghana numbers stay strict", () => {
  expect(normalizePhone("+233 12 345 6789")).toBeNull();
});

test("a number with no + is read as Ghanaian, never guessed as foreign", () => {
  expect(normalizePhone("7700 900123")).toBeNull();
});
