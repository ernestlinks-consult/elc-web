import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test } from "vitest";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui";

beforeEach(() => {
  render(
    <Accordion type="single" collapsible>
      <AccordionItem value="one">
        <AccordionTrigger>Question one</AccordionTrigger>
        <AccordionContent>Answer one</AccordionContent>
      </AccordionItem>
      <AccordionItem value="two">
        <AccordionTrigger>Question two</AccordionTrigger>
        <AccordionContent>Answer two</AccordionContent>
      </AccordionItem>
    </Accordion>,
  );
});

const first = () => screen.getByRole("button", { name: "Question one" });
const second = () => screen.getByRole("button", { name: "Question two" });

test("triggers sit inside headings and start collapsed", () => {
  expect(
    screen.getByRole("heading", { name: "Question one" }),
  ).toBeInTheDocument();
  expect(first()).toHaveAttribute("aria-expanded", "false");
  expect(screen.queryByText("Answer one")).not.toBeInTheDocument();
});

test("Enter and Space toggle a panel", async () => {
  await userEvent.tab();
  await userEvent.keyboard("{Enter}");
  expect(first()).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByText("Answer one")).toBeVisible();

  await userEvent.keyboard(" ");
  expect(first()).toHaveAttribute("aria-expanded", "false");
});

test("arrow keys move between triggers", async () => {
  await userEvent.tab();
  await userEvent.keyboard("{ArrowDown}");
  expect(second()).toHaveFocus();

  await userEvent.keyboard("{ArrowUp}");
  expect(first()).toHaveFocus();
});

test("single mode closes the open panel when another opens", async () => {
  await userEvent.click(first());
  await userEvent.click(second());

  expect(first()).toHaveAttribute("aria-expanded", "false");
  expect(second()).toHaveAttribute("aria-expanded", "true");
});
