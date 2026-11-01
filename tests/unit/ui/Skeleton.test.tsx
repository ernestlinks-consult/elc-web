import { render } from "@testing-library/react";
import { expect, test } from "vitest";
import { Skeleton } from "@/components/ui";

test("is a blue-tint-strong block hidden from screen readers", () => {
  const { container } = render(<Skeleton className="h-40" />);
  const block = container.firstElementChild;

  expect(block).toHaveClass("bg-blue-tint-strong", "h-40");
  expect(block).toHaveAttribute("aria-hidden", "true");
});

test("only animates when motion is allowed", () => {
  const { container } = render(<Skeleton />);

  expect(container.firstElementChild).toHaveClass("motion-safe:animate-pulse");
  expect(container.firstElementChild).not.toHaveClass("animate-pulse");
});
