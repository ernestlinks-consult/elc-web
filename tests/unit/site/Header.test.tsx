import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vitest";
import { Header } from "@/components/site";
import type { NavItem } from "@/lib/site-config";

const pathname = vi.hoisted(() => ({ current: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathname.current,
}));

const nav: NavItem[] = [
  { type: "link", label: "Home", href: "/" },
  {
    type: "menu",
    key: "services",
    label: "Services",
    section: "/services",
    links: [
      { label: "Passports", href: "/services/passports", description: "New" },
      { label: "Travel", href: "/services/travel", description: "Flights" },
    ],
  },
  {
    type: "menu",
    key: "resources",
    label: "Blog & Resources",
    section: "/resources",
    links: [{ label: "Blog", href: "/resources/blog", description: "Guides" }],
  },
  { type: "link", label: "About", href: "/about" },
];

beforeEach(() => {
  pathname.current = "/";
});

function renderHeader() {
  render(
    <>
      <Header nav={nav} whatsappHref="https://wa.me/233" startHref="/start" />
      <p>Outside</p>
      <a href="/next">After the header</a>
    </>,
  );
}

const trigger = (name: string) => screen.getByRole("button", { name });
const services = () => trigger("Services");

test("menus start closed with their links hidden", () => {
  renderHeader();

  expect(services()).toHaveAttribute("aria-expanded", "false");
  expect(screen.queryByRole("link", { name: /Passports/ })).toBeNull();
});

test("the trigger controls its panel", () => {
  renderHeader();

  const panel = document.getElementById(
    services().getAttribute("aria-controls") as string,
  );
  expect(panel).toHaveAttribute("hidden");
});

test.each(["{Enter}", " "])("key %j opens the menu", async (key) => {
  renderHeader();

  services().focus();
  await userEvent.keyboard(key);

  expect(services()).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("link", { name: /Passports/ })).toHaveAttribute(
    "href",
    "/services/passports",
  );
});

test("Escape closes the menu and returns focus to the trigger", async () => {
  renderHeader();
  services().focus();
  await userEvent.keyboard("{Enter}");
  await userEvent.tab();
  expect(screen.getByRole("link", { name: /Passports/ })).toHaveFocus();

  await userEvent.keyboard("{Escape}");

  expect(services()).toHaveAttribute("aria-expanded", "false");
  expect(services()).toHaveFocus();
});

test("clicking outside closes the menu", async () => {
  renderHeader();
  await userEvent.click(services());

  await userEvent.click(screen.getByText("Outside"));

  expect(services()).toHaveAttribute("aria-expanded", "false");
});

test("opening one menu closes the other", async () => {
  renderHeader();
  await userEvent.click(services());

  await userEvent.click(trigger("Blog & Resources"));

  expect(services()).toHaveAttribute("aria-expanded", "false");
  expect(trigger("Blog & Resources")).toHaveAttribute("aria-expanded", "true");
});

test("clicking the trigger again closes the menu", async () => {
  renderHeader();
  await userEvent.click(services());
  await userEvent.click(services());

  expect(services()).toHaveAttribute("aria-expanded", "false");
});

test("tabbing out of the menu closes it", async () => {
  renderHeader();
  await userEvent.click(trigger("Blog & Resources"));

  screen.getByRole("link", { name: "About" }).focus();
  await userEvent.tab();
  await userEvent.tab();
  await userEvent.tab();
  await userEvent.tab();

  expect(screen.getByRole("link", { name: "After the header" })).toHaveFocus();
  expect(trigger("Blog & Resources")).toHaveAttribute("aria-expanded", "false");
});

test("marks the current page", () => {
  pathname.current = "/about";
  renderHeader();

  expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
    "aria-current",
  );
});

test("marks the current section on its menu trigger and page link", async () => {
  pathname.current = "/services/travel";
  renderHeader();

  expect(services()).toHaveAttribute("aria-current", "true");
  await userEvent.click(services());
  expect(screen.getByRole("link", { name: /Travel/ })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("the logo links home and the buttons have the right targets", () => {
  renderHeader();

  expect(
    screen.getByRole("link", { name: "ErnestLinks Consult home" }),
  ).toHaveAttribute("href", "/");
  expect(screen.getByRole("link", { name: "WhatsApp" })).toHaveAttribute(
    "href",
    "https://wa.me/233",
  );
  expect(screen.getByRole("link", { name: "Start online" })).toHaveAttribute(
    "href",
    "/start",
  );
});

test("the mobile menu opens with every link grouped", async () => {
  renderHeader();

  await userEvent.click(screen.getByRole("button", { name: "Menu" }));

  const dialog = await screen.findByRole("dialog", { name: "Menu" });
  expect(
    within(dialog).getByRole("heading", { name: "Services" }),
  ).toBeInTheDocument();
  expect(
    within(dialog).getByRole("link", { name: "Passports" }),
  ).toBeInTheDocument();
  expect(within(dialog).getByRole("link", { name: "Blog" })).toBeInTheDocument();
  expect(
    within(dialog).getByRole("link", { name: "Start online" }),
  ).toHaveAttribute("href", "/start");
  expect(
    within(dialog).getByRole("link", { name: "WhatsApp" }),
  ).toBeInTheDocument();
});

test("Escape closes the mobile menu and returns focus to its button", async () => {
  renderHeader();
  await userEvent.click(screen.getByRole("button", { name: "Menu" }));
  await screen.findByRole("dialog");

  await userEvent.keyboard("{Escape}");

  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(screen.getByRole("button", { name: "Menu" })).toHaveFocus();
});

test("the close button and following a link both close the mobile menu", async () => {
  renderHeader();
  await userEvent.click(screen.getByRole("button", { name: "Menu" }));
  await userEvent.click(
    await screen.findByRole("button", { name: "Close menu" }),
  );
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

  await userEvent.click(screen.getByRole("button", { name: "Menu" }));
  const dialog = await screen.findByRole("dialog");
  await userEvent.click(within(dialog).getByRole("link", { name: "About" }));

  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
});
