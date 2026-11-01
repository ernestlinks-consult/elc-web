import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { Select } from "@/components/ui";

const options = [
  { value: "uk", label: "United Kingdom" },
  { value: "malta", label: "Malta" },
];

test("the label names the trigger", () => {
  render(<Select label="Country" placeholder="Choose" options={options} />);

  expect(screen.getByRole("combobox", { name: "Country" })).toHaveTextContent(
    "Choose",
  );
});

test("keyboard opens the list and selects an option", async () => {
  const onValueChange = vi.fn();
  render(
    <Select label="Country" options={options} onValueChange={onValueChange} />,
  );

  await userEvent.tab();
  await userEvent.keyboard("{Enter}");
  expect(await screen.findByRole("listbox")).toBeInTheDocument();
  await userEvent.keyboard("{ArrowDown}{Enter}");

  expect(onValueChange).toHaveBeenCalledWith("malta");
  expect(screen.getByRole("combobox")).toHaveTextContent("Malta");
});

test("wires errors to the trigger", () => {
  render(<Select label="Country" options={options} error="Choose a country." />);
  const trigger = screen.getByRole("combobox");

  expect(trigger).toHaveAttribute("aria-invalid", "true");
  expect(trigger).toHaveAccessibleDescription("Choose a country.");
});

test("can be disabled", () => {
  render(<Select label="Country" options={options} disabled />);

  expect(screen.getByRole("combobox")).toBeDisabled();
});
