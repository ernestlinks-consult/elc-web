import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { Footer } from "@/components/site";
import { getSiteConfig } from "@/lib/site-config";

vi.mock("@/app/(site)/actions", () => ({ subscribeToAlerts: vi.fn() }));

test("shows the confirmed offices with map links in a new tab", async () => {
  const config = await getSiteConfig();
  render(<Footer config={config} year={2026} />);

  for (const office of config.offices) {
    expect(screen.getByText(office.name)).toBeInTheDocument();

    const link = screen.getByRole("link", {
      name: `Directions to ${office.name} (opens in a new tab)`,
    });
    expect(link).toHaveAttribute("href", office.mapUrl);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener");
  }
});

test("Join the LIVE is a plain link to the LIVE", async () => {
  const config = await getSiteConfig();
  render(<Footer config={config} year={2026} />);

  const link = screen.getByRole("link", { name: "Join the LIVE" });
  expect(link).toHaveAttribute("href", config.live.url);
  expect(link).not.toHaveClass("rounded-pill");
});

test("labels the hotline", async () => {
  const config = await getSiteConfig();
  render(<Footer config={config} year={2026} />);

  expect(
    screen.getByRole("link", { name: "Hotline 032 229 1161" }),
  ).toHaveAttribute("href", "tel:+233322291161");
});
