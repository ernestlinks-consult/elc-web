import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { PhoneBar } from "@/components/site";

test("Call dials the number it is given", () => {
  render(
    <PhoneBar
      startHref="/start"
      whatsappHref="https://wa.me/233537783166?text=HELLO"
      call={{ display: "+233 53 778 3166", tel: "+233537783166" }}
    />,
  );

  expect(screen.getByRole("link", { name: "Call" })).toHaveAttribute(
    "href",
    "tel:+233537783166",
  );
});
