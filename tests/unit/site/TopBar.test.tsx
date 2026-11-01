import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { TopBar } from "@/components/site";
import { getSiteConfig } from "@/lib/site-config";

test("labels the hotline and shows the LIVE slot", async () => {
  const config = await getSiteConfig();

  render(
    <TopBar
      phones={config.phones}
      hotline={config.hotline}
      hours={config.hours.office}
      live={config.live}
    />,
  );

  expect(
    screen.getByRole("link", { name: "Hotline 032 229 1161" }),
  ).toHaveAttribute("href", "tel:+233322291161");
  expect(
    screen.getByRole("link", { name: /Weekdays, 12–2pm on TikTok LIVE/ }),
  ).toBeInTheDocument();
});
