import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { expect, test } from "vitest";
import { Toast, ToastProvider } from "@/components/ui";

function Example({ tone }: { tone?: "success" | "error" }) {
  const [open, setOpen] = useState(true);
  return (
    <ToastProvider>
      <Toast
        open={open}
        onOpenChange={setOpen}
        tone={tone}
        title="Saved"
        description="We have your details."
      />
    </ToastProvider>
  );
}

test("shows the title and description in a labelled region", () => {
  render(<Example />);

  expect(screen.getByRole("region")).toHaveAccessibleName(/notifications/i);
  expect(screen.getAllByText("Saved")[0]).toBeInTheDocument();
  expect(screen.getAllByText("We have your details.")[0]).toBeInTheDocument();
});

test("the dismiss button closes it", async () => {
  render(<Example />);

  await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));

  await waitFor(() =>
    expect(screen.queryByRole("button", { name: "Dismiss" })).toBeNull(),
  );
});

test.each([
  ["success", "bg-success-tint", "text-success"],
  ["error", "bg-red-tint", "text-red-text"],
] as const)("%s tone uses its token pair", (tone, background, text) => {
  render(<Example tone={tone} />);

  expect(screen.getByRole("button", { name: "Dismiss" }).parentElement).toHaveClass(
    background,
    text,
  );
});
