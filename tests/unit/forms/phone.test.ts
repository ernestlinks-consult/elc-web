import { expect, test } from "vitest";
import { normalizeGhanaPhone } from "@/lib/forms/phone";

test.each([
  ["0240000000", "+233240000000"],
  ["024 000 0000", "+233240000000"],
  ["024-000-0000", "+233240000000"],
  ["+233240000000", "+233240000000"],
  ["+233 24 000 0000", "+233240000000"],
  ["233240000000", "+233240000000"],
  ["  053 778 3166 ", "+233537783166"],
])("normalises %s", (input, expected) => {
  expect(normalizeGhanaPhone(input)).toBe(expected);
});

test.each([
  "",
  "12345",
  "024 000 000",
  "024 000 00000",
  "+1 415 555 0100",
  "+233 024 000 0000",
  "abcdefghij",
])("rejects %j", (input) => {
  expect(normalizeGhanaPhone(input)).toBeNull();
});
