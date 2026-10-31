import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import Home from "@/app/(site)/page";

test("home page shows the placeholder heading", () => {
  render(<Home />);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: "ErnestLinks Consult — new site in progress",
    }),
  ).toBeInTheDocument();
});
