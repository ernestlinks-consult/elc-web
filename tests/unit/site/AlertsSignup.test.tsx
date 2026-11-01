import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vitest";
import { AlertsSignup } from "@/components/forms/AlertsSignup";

const subscribeToAlerts = vi.hoisted(() => vi.fn());

vi.mock("@/app/(site)/actions", () => ({ subscribeToAlerts }));

beforeEach(() => {
  subscribeToAlerts.mockReset();
  subscribeToAlerts.mockResolvedValue({ status: "ok" });
});

const number = () => screen.getByRole("textbox", { name: /WhatsApp number/ });
const consent = () => screen.getByRole("checkbox");
const subscribe = () => screen.getByRole("button", { name: "Subscribe" });

async function fillIn() {
  await userEvent.type(number(), "024 000 0000");
  await userEvent.click(consent());
  await userEvent.click(subscribe());
}

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
  expect(subscribeToAlerts).not.toHaveBeenCalled();
});

test("saves through the server action and confirms", async () => {
  render(<AlertsSignup privacyHref="/privacy" />);

  await fillIn();

  expect(await screen.findByRole("status")).toHaveTextContent(/on the list/);
  expect(subscribeToAlerts).toHaveBeenCalledWith({
    whatsapp: "024 000 0000",
    consent: true,
    website: "",
  });
});

test("the not-open-yet message is gone", async () => {
  render(<AlertsSignup privacyHref="/privacy" />);

  await fillIn();

  expect(await screen.findByRole("status")).not.toHaveTextContent(/not saved/);
});

test("a failed save says so and keeps the number", async () => {
  subscribeToAlerts.mockRejectedValue(new Error("offline"));
  render(<AlertsSignup privacyHref="/privacy" />);

  await fillIn();

  expect(await screen.findByRole("alert")).toHaveTextContent("Couldn’t save");
  expect(number()).toHaveValue("024 000 0000");
});

test("a rate limit shows the friendly message", async () => {
  subscribeToAlerts.mockResolvedValue({
    status: "error",
    message: "Please wait a few minutes.",
  });
  render(<AlertsSignup privacyHref="/privacy" />);

  await fillIn();

  expect(await screen.findByRole("alert")).toHaveTextContent("wait a few");
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
