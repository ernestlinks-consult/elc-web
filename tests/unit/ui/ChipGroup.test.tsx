import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { expect, test, vi } from "vitest";
import { ChipGroup } from "@/components/ui";

const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Bravo" },
  { value: "c", label: "Charlie" },
];

test("single select is a fieldset named by its legend", () => {
  render(<ChipGroup legend="Which one?" options={options} />);

  const group = screen.getByRole("radiogroup", { name: "Which one?" });
  expect(group.tagName).toBe("FIELDSET");
  expect(screen.getByText("Which one?").tagName).toBe("LEGEND");
});

test("radios share one name", () => {
  render(<ChipGroup legend="Which one?" name="pick" options={options} />);

  for (const radio of screen.getAllByRole("radio")) {
    expect(radio).toHaveAttribute("name", "pick");
  }
});

test("arrow keys move the single selection", async () => {
  const onChange = vi.fn();
  render(
    <ChipGroup
      legend="Which one?"
      options={options}
      defaultValue="a"
      onChange={onChange}
    />,
  );

  await userEvent.tab();
  expect(screen.getByRole("radio", { name: "Alpha" })).toHaveFocus();
  await userEvent.keyboard("{ArrowDown}");

  expect(screen.getByRole("radio", { name: "Bravo" })).toBeChecked();
  expect(screen.getByRole("radio", { name: "Alpha" })).not.toBeChecked();
  expect(onChange).toHaveBeenLastCalledWith("b");
});

test("space toggles chips in a multi-select", async () => {
  const onChange = vi.fn();
  render(
    <ChipGroup
      legend="Which ones?"
      multiple
      options={options}
      defaultValue={["a"]}
      onChange={onChange}
    />,
  );

  await userEvent.tab();
  await userEvent.tab();
  await userEvent.keyboard(" ");
  expect(onChange).toHaveBeenLastCalledWith(["a", "b"]);

  await userEvent.keyboard(" ");
  expect(onChange).toHaveBeenLastCalledWith(["a"]);
  expect(screen.getByRole("checkbox", { name: "Alpha" })).toBeChecked();
});

test("multi-select is a plain group of checkboxes", () => {
  render(<ChipGroup legend="Which ones?" multiple options={options} />);

  expect(screen.getByRole("group", { name: "Which ones?" })).toBeInTheDocument();
  expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
});

test("wires hint and error to the group", () => {
  render(
    <ChipGroup
      legend="Which one?"
      options={options}
      hint="Pick one."
      error="Choose an option."
    />,
  );
  const group = screen.getByRole("radiogroup");

  expect(group).toHaveAttribute("aria-invalid", "true");
  expect(group).toHaveAccessibleDescription("Pick one. Choose an option.");
});

test("works as a controlled input", async () => {
  function Controlled() {
    const [value, setValue] = useState("a");
    return (
      <ChipGroup
        legend="Which one?"
        options={options}
        value={value}
        onChange={setValue}
      />
    );
  }

  render(<Controlled />);
  await userEvent.click(screen.getByText("Charlie"));

  expect(screen.getByRole("radio", { name: "Charlie" })).toBeChecked();
});

test("disabling the group disables every chip", () => {
  render(<ChipGroup legend="Which one?" options={options} disabled />);

  for (const radio of screen.getAllByRole("radio")) {
    expect(radio).toBeDisabled();
  }
});
