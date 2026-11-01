import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { Stepper } from "@/components/ui";

const steps = ["Start", "About you", "Review"];

test("shows the title and step count in a live region", () => {
  render(<Stepper title="Passport" steps={steps} current={1} />);

  expect(screen.getByText("Passport · Step 2 of 3")).toHaveAttribute(
    "aria-live",
    "polite",
  );
});

test("marks only the current step with aria-current", () => {
  render(<Stepper steps={steps} current={1} />);
  const items = screen.getAllByRole("listitem");

  expect(items[1]).toHaveAttribute("aria-current", "step");
  expect(items[0]).not.toHaveAttribute("aria-current");
  expect(items[2]).not.toHaveAttribute("aria-current");
});

test("announces completed steps in words and ticks them visually", () => {
  render(<Stepper steps={steps} current={1} />);
  const done = screen.getAllByRole("listitem")[0];

  expect(done).toHaveTextContent("Completed: Start");
  expect(within(done).getByText("✓")).toHaveAttribute("aria-hidden", "true");
  expect(done).toHaveClass("text-success");
});

test("numbers later steps and mutes them", () => {
  render(<Stepper steps={steps} current={0} />);
  const later = screen.getAllByRole("listitem")[2];

  expect(later).toHaveTextContent("3. Review");
  expect(later).toHaveClass("text-ink-muted");
});

test("the progress bar width follows the current step", () => {
  const { container } = render(<Stepper steps={steps} current={1} />);

  expect(container.querySelector(".bg-blue")).toHaveStyle({ width: "67%" });
});

test("renders the time note", () => {
  render(<Stepper steps={steps} current={0} note="About 8 minutes in total" />);

  expect(screen.getByText("About 8 minutes in total")).toBeInTheDocument();
});
