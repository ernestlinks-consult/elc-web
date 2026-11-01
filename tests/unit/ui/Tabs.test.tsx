import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test } from "vitest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";

beforeEach(() => {
  render(
    <Tabs defaultValue="one">
      <TabsList aria-label="Services">
        <TabsTrigger value="one">One</TabsTrigger>
        <TabsTrigger value="two">Two</TabsTrigger>
        <TabsTrigger value="three">Three</TabsTrigger>
      </TabsList>
      <TabsContent value="one">Panel one</TabsContent>
      <TabsContent value="two">Panel two</TabsContent>
      <TabsContent value="three">Panel three</TabsContent>
    </Tabs>,
  );
});

test("exposes tab semantics and shows the default panel", () => {
  expect(screen.getByRole("tablist", { name: "Services" })).toBeInTheDocument();
  expect(screen.getByRole("tab", { name: "One" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel one");
});

test("arrow keys move between tabs and change the panel", async () => {
  await userEvent.tab();
  expect(screen.getByRole("tab", { name: "One" })).toHaveFocus();

  await userEvent.keyboard("{ArrowRight}");

  expect(screen.getByRole("tab", { name: "Two" })).toHaveFocus();
  expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel two");
});

test("Home and End jump to the first and last tab", async () => {
  await userEvent.tab();
  await userEvent.keyboard("{End}");
  expect(screen.getByRole("tab", { name: "Three" })).toHaveFocus();

  await userEvent.keyboard("{Home}");
  expect(screen.getByRole("tab", { name: "One" })).toHaveFocus();
});

test("Tab moves from the tab list into the panel", async () => {
  await userEvent.tab();
  await userEvent.tab();

  expect(screen.getByRole("tabpanel")).toHaveFocus();
});
