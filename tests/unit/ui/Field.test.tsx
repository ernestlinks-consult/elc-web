import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { expect, test, vi } from "vitest";
import { Field } from "@/components/ui";

test("links the label to the input", () => {
  render(<Field label="Email" />);

  expect(screen.getByLabelText("Email")).toHaveAttribute("type", "text");
});

test("wires the error to aria-describedby and aria-invalid", () => {
  render(<Field label="Email" error="Enter a full email address." />);
  const input = screen.getByRole("textbox");
  const alert = screen.getByRole("alert");

  expect(input).toHaveAttribute("aria-invalid", "true");
  expect(input.getAttribute("aria-describedby")).toBe(alert.id);
  expect(input).toHaveAccessibleDescription("Enter a full email address.");
  expect(input).toHaveClass("border-2", "border-red-text");
});

test("describes the input with both hint and error", () => {
  render(<Field label="Email" hint="We reply here." error="Check this." />);

  expect(screen.getByRole("textbox")).toHaveAccessibleDescription(
    "We reply here. Check this.",
  );
});

test("is not marked invalid without an error", () => {
  render(<Field label="Email" hint="We reply here." />);

  expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid");
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

test("marks required with a hidden star and optional in words", () => {
  render(
    <>
      <Field label="Name" required />
      <Field label="Email" optional />
    </>,
  );

  expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true");
  expect(screen.getByRole("textbox", { name: "Name" })).toBeRequired();
  expect(screen.getByLabelText("Email (optional)")).toBeInTheDocument();
});

test("multiline renders a textarea with four rows", () => {
  render(<Field label="Message" multiline />);

  const textarea = screen.getByRole("textbox");
  expect(textarea.tagName).toBe("TEXTAREA");
  expect(textarea).toHaveAttribute("rows", "4");
});

test("never uses red on the deep surface", () => {
  render(
    <Field label="Phone" surface="deep" required error="Check this number." />,
  );

  expect(screen.getByRole("alert")).toHaveClass("text-on-blue");
  expect(screen.getByRole("textbox")).toHaveClass("border-on-blue");
  expect(screen.getByText("*")).toHaveClass("text-on-blue");
  expect(document.body.innerHTML).not.toMatch(/(text|border|bg)-red/);
});

test("works with react-hook-form register", async () => {
  const onValid = vi.fn();

  function Form() {
    const { register, handleSubmit } = useForm<{ phone: string }>();
    return (
      <form onSubmit={handleSubmit((values) => onValid(values))}>
        <Field label="Phone" {...register("phone")} />
        <button type="submit">Send</button>
      </form>
    );
  }

  render(<Form />);
  await userEvent.type(screen.getByLabelText("Phone"), "024 000 0000");
  await userEvent.click(screen.getByRole("button", { name: "Send" }));

  expect(onValid).toHaveBeenCalledWith({ phone: "024 000 0000" });
});
