import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui";

function Example({ selected = false }) {
  return (
    <Table caption="Leads">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow selected={selected}>
          <TableCell>Sample</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

test("is a semantic table named by its caption", () => {
  render(<Example />);

  expect(screen.getByRole("table", { name: "Leads" })).toBeInTheDocument();
  expect(screen.getByRole("columnheader", { name: "Name" })).toHaveAttribute(
    "scope",
    "col",
  );
  expect(screen.getByRole("cell", { name: "Sample" })).toBeInTheDocument();
});

test("scrolls inside a named, keyboard-focusable region", () => {
  render(<Example />);
  const region = screen.getByRole("region", { name: "Leads" });

  expect(region).toHaveClass("overflow-x-auto");
  expect(region).toHaveAttribute("tabindex", "0");
});

test("a selected row uses blue-tint", () => {
  render(<Example selected />);

  expect(screen.getByRole("cell", { name: "Sample" }).parentElement).toHaveClass(
    "bg-blue-tint",
  );
});
