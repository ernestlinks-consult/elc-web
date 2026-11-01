import { expect, test } from "vitest";
import { cn } from "@/lib/cn";

test("keeps a type style alongside a text colour", () => {
  expect(cn("text-label text-ink")).toBe("text-label text-ink");
});

test("later values win within each custom group", () => {
  expect(cn("text-label", "text-body")).toBe("text-body");
  expect(cn("text-ink", "text-blue")).toBe("text-blue");
  expect(cn("rounded-md", "rounded-pill")).toBe("rounded-pill");
  expect(cn("shadow-float", "shadow-menu")).toBe("shadow-menu");
  expect(cn("p-space-4", "p-space-5")).toBe("p-space-5");
});

test("ignores falsy values", () => {
  expect(cn("flex", false, undefined, "gap-space-2")).toBe("flex gap-space-2");
});
