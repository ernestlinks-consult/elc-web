import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { Breadcrumbs } from "@/components/site";

const items = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services/passports" },
  { label: "Passports" },
];

test("is a labelled nav around an ordered list", () => {
  render(<Breadcrumbs items={items} />);
  const nav = screen.getByRole("navigation", { name: "Breadcrumb" });

  expect(within(nav).getByRole("list").tagName).toBe("OL");
  expect(within(nav).getAllByRole("listitem")).toHaveLength(3);
});

test("links every item except the current page", () => {
  render(<Breadcrumbs items={items} />);

  expect(screen.getByRole("link", { name: "Services" })).toHaveAttribute(
    "href",
    "/services/passports",
  );
  expect(screen.queryByRole("link", { name: "Passports" })).toBeNull();
  expect(screen.getByText("Passports")).toHaveAttribute("aria-current", "page");
});

test("hides the separators from screen readers", () => {
  render(<Breadcrumbs items={items} />);

  for (const separator of screen.getAllByText("/")) {
    expect(separator).toHaveAttribute("aria-hidden", "true");
  }
});

test("renders nothing without items", () => {
  const { container } = render(<Breadcrumbs items={[]} />);

  expect(container).toBeEmptyDOMElement();
});
