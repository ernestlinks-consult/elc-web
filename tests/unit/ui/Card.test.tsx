import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Card } from "@/components/ui";

test("the whole card is the link when given an href", () => {
  render(
    <Card href="/services" eyebrow="Malta · BSc" title="Care" action="Go →">
      Short line
    </Card>,
  );

  const link = screen.getByRole("link");
  expect(link).toHaveAttribute("href", "/services");
  expect(link).toHaveTextContent("Malta · BSc");
  expect(link).toHaveTextContent("Care");
  expect(link).toHaveTextContent("Short line");
  expect(link).toHaveTextContent("Go →");
});

test("renders no link without an href", () => {
  render(<Card title="Care" />);

  expect(screen.queryByRole("link")).not.toBeInTheDocument();
  expect(screen.getByText("Care")).toBeInTheDocument();
});

test("the title uses h4 and the body uses muted body-sm", () => {
  render(<Card title="Care">Short line</Card>);

  expect(screen.getByText("Care")).toHaveClass("text-h4");
  expect(screen.getByText("Short line")).toHaveClass(
    "text-body-sm",
    "text-ink-muted",
  );
});

test.each([
  ["light", "bg-surface"],
  ["tint", "bg-blue-tint"],
  ["blue", "bg-blue"],
] as const)("%s tone uses %s", (tone, background) => {
  render(<Card href="/x" tone={tone} title="Care" />);

  expect(screen.getByRole("link")).toHaveClass(background);
});

test.each(["light", "tint"] as const)(
  "%s cards use red-text for the eyebrow",
  (tone) => {
    render(<Card tone={tone} title="Care" eyebrow="Malta · BSc" />);

    expect(screen.getByText("Malta · BSc")).toHaveClass("text-red-text");
  },
);

test("blue cards keep muted text readable on blue", () => {
  render(
    <Card tone="blue" title="Next" eyebrow="Stage" action="Go →">
      Line
    </Card>,
  );

  expect(screen.getByText("Stage")).toHaveClass("text-on-blue-muted");
  expect(screen.getByText("Line")).toHaveClass("text-on-blue-muted");
  expect(screen.getByText("Go →")).toHaveClass("text-on-blue");
});
