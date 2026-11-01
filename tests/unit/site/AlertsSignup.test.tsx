import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { AlertsSignup } from "@/components/forms/AlertsSignup";

afterEach(() => {
  vi.unstubAllGlobals();
});

const number = () => screen.getByRole("textbox");
const consent = () => screen.getByRole("checkbox");
const subscribe = () => screen.getByRole("button", { name: "Subscribe" });

test("shows plain-language errors and no red on the blue footer", async () => {
  render(<AlertsSignup privacyHref="/privacy" />);

  await userEvent.click(subscribe());

  expect(await screen.findByText(/Enter a WhatsApp number/)).toHaveClass(
    "text-on-blue",
  );
  expect(screen.getByText(/Tick the box/)).toHaveClass("text-on-blue");
  expect(number()).toHaveAttribute("aria-invalid", "true");
  expect(consent()).toHaveAttribute("aria-invalid", "true");
  expect(consent()).toHaveAccessibleDescription(/Tick the box/);
});

test("accepts a spaced number and sends nothing anywhere", async () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  render(<AlertsSignup privacyHref="/privacy" />);

  await userEvent.type(number(), "024 000 0000");
  await userEvent.click(consent());
  await userEvent.click(subscribe());

  expect(await screen.findByRole("status")).toHaveTextContent(/was not saved/);
  expect(fetch).not.toHaveBeenCalled();
});

test("uses the approved consent wording", () => {
  render(<AlertsSignup privacyHref="/privacy" />);

  expect(
    screen.getByRole("checkbox", {
      name: "I agree that ErnestLinks Consult may send me Scholarship Hunt alerts on WhatsApp. I can stop them anytime by replying STOP.",
    }),
  ).toBeInTheDocument();
});

test("links to the privacy notice", () => {
  render(<AlertsSignup privacyHref="/privacy" />);

  expect(screen.getByRole("link", { name: "Privacy notice" })).toHaveAttribute(
    "href",
    "/privacy",
  );
});
