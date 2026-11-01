import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui";

function Example() {
  return (
    <>
      <button>Outside</button>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open</Button>
        </DialogTrigger>
        <DialogContent title="Finish later?" description="We will message you.">
          <DialogClose asChild>
            <Button>Keep going</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}

async function open() {
  render(<Example />);
  await userEvent.click(screen.getByRole("button", { name: "Open" }));
  return screen.findByRole("dialog");
}

test("is named and described by its title and description", async () => {
  const dialog = await open();

  expect(dialog).toHaveAccessibleName("Finish later?");
  expect(dialog).toHaveAccessibleDescription("We will message you.");
});

test("traps focus while Tab cycles through its controls", async () => {
  const dialog = await open();

  await waitFor(() =>
    expect(dialog.contains(document.activeElement)).toBe(true),
  );
  for (let press = 0; press < 5; press += 1) {
    await userEvent.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);
  }
  await userEvent.tab({ shift: true });
  expect(dialog.contains(document.activeElement)).toBe(true);
});

test("Escape closes it and returns focus to the trigger", async () => {
  await open();

  await userEvent.keyboard("{Escape}");

  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  expect(screen.getByRole("button", { name: "Open" })).toHaveFocus();
});

test("the close button has an accessible name and closes it", async () => {
  await open();

  await userEvent.click(screen.getByRole("button", { name: "Close" }));

  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
});
