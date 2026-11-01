import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Badge, type BadgeTone } from "@/components/ui";

const tones: [BadgeTone, string, string][] = [
  ["neutral", "bg-neutral-tint", "text-ink-muted"],
  ["blue", "bg-blue-tint-strong", "text-blue"],
  ["solid", "bg-blue", "text-on-blue"],
  ["red", "bg-red", "text-on-blue"],
  ["new", "bg-red-tint", "text-red-text"],
  ["success", "bg-success-tint", "text-success"],
  ["warning", "bg-warning-tint", "text-warning"],
];

test.each(tones)("%s tone uses its token pair", (tone, background, text) => {
  render(<Badge tone={tone}>Word</Badge>);

  expect(screen.getByText("Word")).toHaveClass(background, text, "uppercase");
});

test("defaults to neutral and accepts className", () => {
  render(<Badge className="ml-space-2">Closed</Badge>);

  expect(screen.getByText("Closed")).toHaveClass(
    "bg-neutral-tint",
    "ml-space-2",
  );
});
