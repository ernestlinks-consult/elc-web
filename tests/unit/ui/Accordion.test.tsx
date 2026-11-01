import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  type AccordionHeadingLevel,
} from "@/components/ui";

function Example({ headingLevel }: { headingLevel?: AccordionHeadingLevel }) {
  return (
    <Accordion type="single" collapsible headingLevel={headingLevel}>
      <AccordionItem value="one">
        <AccordionTrigger>Question one</AccordionTrigger>
        <AccordionContent>Answer one</AccordionContent>
      </AccordionItem>
      <AccordionItem value="two">
        <AccordionTrigger>Question two</AccordionTrigger>
        <AccordionContent>Answer two</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

const first = () => screen.getByRole("button", { name: "Question one" });
const second = () => screen.getByRole("button", { name: "Question two" });

test("triggers sit inside h3 headings by default and start collapsed", () => {
  render(<Example />);

  expect(
    screen.getByRole("heading", { level: 3, name: "Question one" }),
  ).toBeInTheDocument();
  expect(first()).toHaveAttribute("aria-expanded", "false");
  expect(screen.queryByText("Answer one")).not.toBeInTheDocument();
});

test.each([2, 3, 4] as const)("headingLevel %i sets the heading", (level) => {
  render(<Example headingLevel={level} />);

  expect(
    screen.getByRole("heading", { level, name: "Question two" }),
  ).toBeInTheDocument();
});

test("Enter and Space toggle a panel", async () => {
  render(<Example />);

  await userEvent.tab();
  await userEvent.keyboard("{Enter}");
  expect(first()).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByText("Answer one")).toBeVisible();

  await userEvent.keyboard(" ");
  expect(first()).toHaveAttribute("aria-expanded", "false");
});

test("arrow keys move between triggers", async () => {
  render(<Example />);

  await userEvent.tab();
  await userEvent.keyboard("{ArrowDown}");
  expect(second()).toHaveFocus();

  await userEvent.keyboard("{ArrowUp}");
  expect(first()).toHaveFocus();
});

test("single mode closes the open panel when another opens", async () => {
  render(<Example />);

  await userEvent.click(first());
  await userEvent.click(second());

  expect(first()).toHaveAttribute("aria-expanded", "false");
  expect(second()).toHaveAttribute("aria-expanded", "true");
});
