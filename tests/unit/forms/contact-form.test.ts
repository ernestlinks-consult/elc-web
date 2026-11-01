import { expect, test } from "vitest";
import { contactSchema } from "@/lib/forms/contact";

const valid = {
  full_name: "Ama Mensah",
  whatsapp: "024 000 0000",
  email: "",
  topic: "Partnership",
  message: "Hello",
  consent: true,
};

test("accepts a message and normalises the phone", () => {
  const parsed = contactSchema.parse(valid);

  expect(parsed.whatsapp).toBe("+233240000000");
  expect(parsed.email).toBeUndefined();
});

test.each([
  ["full_name", ""],
  ["whatsapp", "12345"],
  ["email", "nope"],
  ["topic", ""],
  ["topic", "Something else"],
  ["message", "   "],
  ["consent", false],
])("rejects %s = %j", (key, value) => {
  const result = contactSchema.safeParse({ ...valid, [key]: value });

  expect(result.success).toBe(false);
  expect(result.error?.issues[0].path[0]).toBe(key);
});
