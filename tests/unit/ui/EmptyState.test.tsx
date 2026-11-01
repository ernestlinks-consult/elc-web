import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Button, EmptyState } from "@/components/ui";

test("shows one sentence and one action", () => {
  render(
    <EmptyState
      message="No open scholarships right now."
      action={<Button href="/alerts">Get alerts</Button>}
    />,
  );

  expect(
    screen.getByText("No open scholarships right now."),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Get alerts" })).toHaveAttribute(
    "href",
    "/alerts",
  );
});
