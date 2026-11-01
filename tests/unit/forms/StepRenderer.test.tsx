import { zodResolver } from "@hookform/resolvers/zod";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm, type Control, type Resolver } from "react-hook-form";
import { expect, test, vi } from "vitest";
import { StepRenderer } from "@/components/forms/StepRenderer";
import { defineStep } from "@/lib/forms/build";

const step = defineStep({
  key: "test",
  title: "Test",
  fields: [
    { kind: "heading", label: "A heading" },
    { kind: "note", label: "A note" },
    {
      kind: "radio",
      key: "plan",
      label: "Package",
      required: true,
      options: ["Standard", "Express"],
      optionPrices: { Standard: "passport_standard" },
    },
    {
      kind: "checkboxes",
      key: "countries",
      label: "Countries",
      required: true,
      options: ["UK", "Malta"],
    },
    {
      kind: "select",
      key: "status",
      label: "Status",
      required: true,
      options: ["Valid", "Expired"],
    },
    { kind: "tick", key: "agree", label: "I agree", required: true, privacyLink: true },
  ],
});

function Harness({
  onValid,
  serverErrors,
}: {
  onValid: (values: Record<string, unknown>) => void;
  serverErrors?: Record<string, string>;
}) {
  const { control, handleSubmit } = useForm<Record<string, unknown>>({
    resolver: zodResolver(step.schema as never) as Resolver<
      Record<string, unknown>
    >,
    defaultValues: { plan: "", countries: [], status: "", agree: false },
  });

  return (
    <form noValidate onSubmit={handleSubmit((values) => onValid(values))}>
      <StepRenderer
        stepKey={step.key}
        fields={step.fields}
        control={control as unknown as Control}
        serverErrors={serverErrors}
        priceLabels={{ passport_standard: "GH¢600" }}
        privacyHref="/privacy"
      />
      <button type="submit">Save</button>
    </form>
  );
}

const save = () =>
  userEvent.click(screen.getByRole("button", { name: "Save" }));

test("renders headings, notes and the price from the database", () => {
  render(<Harness onValid={vi.fn()} />);

  expect(screen.getByRole("heading", { name: "A heading" })).toBeInTheDocument();
  expect(screen.getByText("A note")).toBeInTheDocument();
  expect(
    screen.getByRole("radio", { name: "Standard · GH¢600" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("radio", { name: "Express" })).toBeInTheDocument();
});

test("ChipGroup, Select and the tick feed react-hook-form through Controller", async () => {
  const onValid = vi.fn();
  render(<Harness onValid={onValid} />);

  await userEvent.click(screen.getByRole("radio", { name: "Express" }));
  await userEvent.click(screen.getByRole("checkbox", { name: "UK" }));
  await userEvent.click(screen.getByRole("checkbox", { name: "Malta" }));
  await userEvent.click(screen.getByRole("combobox", { name: /Status/ }));
  await userEvent.click(await screen.findByRole("option", { name: "Expired" }));
  await userEvent.click(screen.getByRole("checkbox", { name: /I agree/ }));
  await save();

  expect(onValid).toHaveBeenCalledWith({
    plan: "Express",
    countries: ["UK", "Malta"],
    status: "Expired",
    agree: true,
  });
});

test("errors show under each control and focus moves to the first", async () => {
  render(<Harness onValid={vi.fn()} />);

  await save();

  expect(await screen.findByText("Choose at least one.")).toBeInTheDocument();
  expect(screen.getAllByText("Choose one.")).toHaveLength(2);
  expect(screen.getByRole("radio", { name: "Standard · GH¢600" })).toHaveFocus();
});

test("unticking a chip clears it again", async () => {
  const onValid = vi.fn();
  render(<Harness onValid={onValid} />);

  const uk = screen.getByRole("checkbox", { name: "UK" });
  await userEvent.click(uk);
  await userEvent.click(uk);

  expect(uk).not.toBeChecked();
});

test("server errors show when the browser posted without JavaScript", () => {
  render(
    <Harness onValid={vi.fn()} serverErrors={{ plan: "Choose one, please." }} />,
  );

  expect(screen.getByRole("alert")).toHaveTextContent("Choose one, please.");
});

test("the consent tick links to the privacy notice", () => {
  render(<Harness onValid={vi.fn()} />);

  expect(screen.getByRole("link", { name: "Privacy notice" })).toHaveAttribute(
    "href",
    "/privacy",
  );
});
