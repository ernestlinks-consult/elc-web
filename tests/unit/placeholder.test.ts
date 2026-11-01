import { expect, test } from "vitest";
import { isPlaceholder, publicValue } from "@/lib/content/placeholder";

test.each([
  "[PLACEHOLDER: reply-time promise, waiting on ELC]",
  "About [PLACEHOLDER] days",
  ["ok", "[PLACEHOLDER]"],
  { name: "ok", number: "[PLACEHOLDER: number]" },
  { nested: { deep: ["[PLACEHOLDER]"] } },
])("finds a placeholder in %j", (value) => {
  expect(isPlaceholder(value)).toBe(true);
});

test.each(["within 2 working hours", "", 600, null, undefined, [], {}])(
  "passes %j",
  (value) => {
    expect(isPlaceholder(value)).toBe(false);
  },
);

test("publicValue hides a placeholder and keeps a real value", () => {
  expect(publicValue("[PLACEHOLDER: x]")).toBeNull();
  expect(publicValue("within 2 working hours")).toBe("within 2 working hours");
});
