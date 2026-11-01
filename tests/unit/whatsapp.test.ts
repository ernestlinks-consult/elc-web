import { expect, test } from "vitest";
import { buildWhatsAppLink } from "@/lib/whatsapp";

test("strips formatting from the number", () => {
  expect(buildWhatsAppLink("+233 53-778 3166")).toBe(
    "https://wa.me/233537783166",
  );
});

test("adds a keyword as the prefilled text", () => {
  expect(buildWhatsAppLink("233537783166", { keyword: "PASSPORT" })).toBe(
    "https://wa.me/233537783166?text=PASSPORT",
  );
});

test("joins message and keyword, and encodes them", () => {
  expect(
    buildWhatsAppLink("233537783166", {
      message: "Hi ELC & team",
      keyword: "MALTA CARE",
    }),
  ).toBe("https://wa.me/233537783166?text=Hi%20ELC%20%26%20team%20MALTA%20CARE");
});
