import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, type FormEvent } from "react";
import { expect, test, vi } from "vitest";
import { Button } from "@/components/ui";

test("renders a button of type button by default", () => {
  render(<Button>Start online</Button>);

  expect(screen.getByRole("button", { name: "Start online" })).toHaveAttribute(
    "type",
    "button",
  );
});

test("renders a link when given an href", () => {
  render(<Button href="/start">Start online</Button>);

  expect(screen.getByRole("link", { name: "Start online" })).toHaveAttribute(
    "href",
    "/start",
  );
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});

test("forwards the ref and merges className", () => {
  const ref = createRef<HTMLButtonElement>();
  render(
    <Button ref={ref} className="mt-space-2">
      Go
    </Button>,
  );

  expect(ref.current).toHaveClass("mt-space-2", "bg-blue");
});

test("disabled buttons do not fire onClick", async () => {
  const onClick = vi.fn();
  render(
    <Button disabled onClick={onClick}>
      Publish
    </Button>,
  );

  await userEvent.click(screen.getByRole("button"));

  expect(onClick).not.toHaveBeenCalled();
  expect(screen.getByRole("button")).toBeDisabled();
});

test("loading blocks clicks, stays focusable and shows loadingText", async () => {
  const onClick = vi.fn();
  render(
    <Button loading loadingText="Saving…" onClick={onClick}>
      Save
    </Button>,
  );
  const button = screen.getByRole("button", { name: "Saving…" });

  await userEvent.tab();
  expect(button).toHaveFocus();
  await userEvent.click(button);

  expect(onClick).not.toHaveBeenCalled();
  expect(button).toHaveAttribute("aria-busy", "true");
  expect(button).toHaveAttribute("aria-disabled", "true");
});

test("a loading submit button does not submit its form", async () => {
  const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());
  render(
    <form onSubmit={onSubmit}>
      <Button type="submit" loading>
        Send
      </Button>
    </form>,
  );

  await userEvent.click(screen.getByRole("button"));

  expect(onSubmit).not.toHaveBeenCalled();
});

test("a disabled link has no href and leaves the tab order", async () => {
  render(
    <Button href="/start" disabled>
      Start online
    </Button>,
  );
  const link = screen.getByRole("link", { name: "Start online" });

  expect(link).not.toHaveAttribute("href");
  expect(link).toHaveAttribute("aria-disabled", "true");
  await userEvent.tab();
  expect(link).not.toHaveFocus();
});

test("hides icon slots from screen readers", () => {
  render(
    <Button leadingIcon={<svg data-testid="lead" />} trailingIcon="→">
      Next
    </Button>,
  );

  expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
  expect(screen.getByTestId("lead").parentElement).toHaveAttribute(
    "aria-hidden",
    "true",
  );
});

test("red fills always use white text", () => {
  render(<Button variant="red">Choose Express</Button>);

  expect(screen.getByRole("button")).toHaveClass("bg-red", "text-on-blue");
});
