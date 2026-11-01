import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vitest";
import { ContactForm } from "@/components/forms/ContactForm";

const sendContactMessage = vi.hoisted(() => vi.fn());

vi.mock("@/app/(site)/actions", () => ({ sendContactMessage }));

beforeEach(() => {
  sendContactMessage.mockReset();
  sendContactMessage.mockResolvedValue({ status: "ok" });
});

const send = () =>
  userEvent.click(screen.getByRole("button", { name: "Send message" }));

test("requires name, WhatsApp, topic, message and consent", async () => {
  render(<ContactForm privacyHref="/privacy" />);

  await send();

  expect(await screen.findByText("Enter your full name.")).toBeInTheDocument();
  expect(screen.getByText("Choose a topic.")).toBeInTheDocument();
  expect(screen.getByText("Enter your message.")).toBeInTheDocument();
  expect(sendContactMessage).not.toHaveBeenCalled();
});

test("sends through the server action", async () => {
  render(<ContactForm privacyHref="/privacy" />);

  await userEvent.type(screen.getByRole("textbox", { name: /Full name/ }), "Ama");
  await userEvent.type(
    screen.getByRole("textbox", { name: /WhatsApp number/ }),
    "0240000000",
  );
  await userEvent.click(screen.getByRole("combobox", { name: /Topic/ }));
  await userEvent.click(
    await screen.findByRole("option", { name: "Partnership" }),
  );
  await userEvent.type(screen.getByRole("textbox", { name: /Message/ }), "Hi");
  await userEvent.click(screen.getByRole("checkbox"));
  await send();

  expect(await screen.findByRole("status")).toHaveTextContent(/reached our team/);
  expect(sendContactMessage).toHaveBeenCalledWith(
    expect.objectContaining({
      full_name: "Ama",
      topic: "Partnership",
      message: "Hi",
      consent: true,
    }),
  );
});
