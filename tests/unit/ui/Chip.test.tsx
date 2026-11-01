import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { expect, test } from "vitest";
import { Chip, FilterChip } from "@/components/ui";

test("is a radio by default", () => {
  render(<Chip name="package" label="Standard" />);

  expect(screen.getByRole("radio", { name: "Standard" })).toBeInTheDocument();
});

test("is a checkbox when multiple", () => {
  render(<Chip multiple label="Malta" />);

  expect(screen.getByRole("checkbox", { name: "Malta" })).toBeInTheDocument();
});

test("clicking the label selects it", async () => {
  render(<Chip multiple label="Malta" />);

  await userEvent.click(screen.getByText("Malta"));

  expect(screen.getByRole("checkbox")).toBeChecked();
});

test("FilterChip is a toggle button using aria-pressed", async () => {
  function Filter() {
    const [pressed, setPressed] = useState(false);
    return (
      <FilterChip pressed={pressed} onClick={() => setPressed(!pressed)}>
        Open
      </FilterChip>
    );
  }

  render(<Filter />);
  const button = screen.getByRole("button", { name: "Open" });
  expect(button).toHaveAttribute("aria-pressed", "false");

  await userEvent.click(button);

  expect(button).toHaveAttribute("aria-pressed", "true");
});
