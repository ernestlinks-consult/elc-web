import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { Pagination } from "@/components/ui";

const href = (page: number) => `/blog?page=${page}`;

test("is a labelled navigation of links", () => {
  render(<Pagination page={2} totalPages={3} hrefForPage={href} />);
  const nav = screen.getByRole("navigation", { name: "Pagination" });

  expect(within(nav).getByRole("link", { name: "Page 3" })).toHaveAttribute(
    "href",
    "/blog?page=3",
  );
});

test("marks only the current page with aria-current", () => {
  render(<Pagination page={2} totalPages={3} hrefForPage={href} />);

  expect(screen.getByRole("link", { name: "Page 2" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  expect(screen.getByRole("link", { name: "Page 1" })).not.toHaveAttribute(
    "aria-current",
  );
});

test("Previous and Next link to neighbouring pages", () => {
  render(<Pagination page={2} totalPages={3} hrefForPage={href} />);

  expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute(
    "href",
    "/blog?page=1",
  );
  expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute(
    "href",
    "/blog?page=3",
  );
});

test("the first page has no Previous link and the last no Next link", () => {
  const { rerender } = render(
    <Pagination page={1} totalPages={3} hrefForPage={href} />,
  );
  expect(screen.queryByRole("link", { name: "Previous" })).toBeNull();

  rerender(<Pagination page={3} totalPages={3} hrefForPage={href} />);
  expect(screen.queryByRole("link", { name: "Next" })).toBeNull();
});

test("collapses long ranges around the current page", () => {
  render(<Pagination page={6} totalPages={12} hrefForPage={href} />);
  const pages = screen
    .getAllByRole("link", { name: /^Page/ })
    .map((link) => link.textContent);

  expect(pages).toEqual(["1", "5", "6", "7", "12"]);
  expect(screen.getAllByText("…")).toHaveLength(2);
});
