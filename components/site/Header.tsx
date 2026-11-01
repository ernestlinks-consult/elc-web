"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";
import { ChatIcon, ChevronDownIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { NavItem, NavMenu } from "@/lib/site-config";
import { MobileMenu } from "./MobileMenu";
import { isCurrentPath } from "./nav";

export type HeaderProps = {
  nav: NavItem[];
  whatsappHref: string;
  startHref: string;
};

const navItemClasses =
  "inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-sm px-1.5 text-body font-medium whitespace-nowrap text-ink no-underline wide:gap-1.5 wide:px-3";
const currentClasses = "font-extrabold text-blue";

function MenuPanel({
  id,
  menu,
  open,
  pathname,
  onNavigate,
}: {
  id: string;
  menu: NavMenu;
  open: boolean;
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <div
      id={id}
      hidden={!open}
      className="absolute inset-x-0 top-full border-b border-line bg-surface shadow-menu"
    >
      <ul className="container grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-space-2 py-space-5">
        {menu.links.map((link) => {
          const current = isCurrentPath(pathname, link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={current ? "page" : undefined}
                onClick={onNavigate}
                className="flex h-full flex-col gap-space-1 rounded-md bg-blue-tint p-space-4 text-ink no-underline"
              >
                <strong
                  className={cn("text-body font-bold", current && "text-blue")}
                >
                  {link.label}
                </strong>
                <span className="text-body-sm text-ink-muted">
                  {link.description}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Header({ nav, whatsappHref, startHref }: HeaderProps) {
  const pathname = usePathname();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const triggers = useRef(new Map<string, HTMLButtonElement>());

  useEffect(() => {
    if (!openKey) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || !openKey) return;
      setOpenKey(null);
      triggers.current.get(openKey)?.focus();
    }

    function handlePointerDown(event: PointerEvent) {
      if (!navRef.current?.contains(event.target as Node)) setOpenKey(null);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [openKey]);

  return (
    <header className="relative z-40 border-b border-line bg-surface">
      <div className="container flex items-center justify-between gap-x-3 py-3 wide:gap-x-7">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/brand/web-elc-logo-vertical-stack.svg"
            alt="ErnestLinks Consult home"
            width={103}
            height={58}
            loading="eager"
          />
        </Link>

        <nav
          ref={navRef}
          aria-label="Main"
          className="max-phone:hidden"
          onBlur={(event) => {
            const next = event.relatedTarget as Node | null;
            if (next && !event.currentTarget.contains(next)) setOpenKey(null);
          }}
        >
          <ul className="flex items-center wide:gap-x-1.5">
            {nav.map((item) => {
              if (item.type === "link") {
                const current = isCurrentPath(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={current ? "page" : undefined}
                      className={cn(navItemClasses, current && currentClasses)}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              }

              const open = openKey === item.key;
              const current = isCurrentPath(pathname, item.section, false);
              const panelId = `${item.key}-menu`;
              return (
                <li key={item.key}>
                  <button
                    ref={(element) => {
                      if (element) triggers.current.set(item.key, element);
                    }}
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    aria-current={current ? "true" : undefined}
                    onClick={() => setOpenKey(open ? null : item.key)}
                    className={cn(
                      navItemClasses,
                      (current || open) && currentClasses,
                      open && "bg-blue-tint",
                    )}
                  >
                    {item.label}
                    <ChevronDownIcon
                      width={14}
                      height={14}
                      className={cn(open && "rotate-180")}
                    />
                  </button>
                  <MenuPanel
                    id={panelId}
                    menu={item}
                    open={open}
                    pathname={pathname}
                    onNavigate={() => setOpenKey(null)}
                  />
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2.5 max-phone:hidden">
          <Button
            href={whatsappHref}
            variant="secondary"
            aria-label="Chat on WhatsApp"
            className="max-wide:size-11 max-wide:px-0"
          >
            <ChatIcon className="wide:hidden" />
            <span className="max-wide:hidden">WhatsApp</span>
          </Button>
          <Button href={startHref} className="max-wide:px-4">
            Start online
          </Button>
        </div>

        <MobileMenu
          nav={nav}
          whatsappHref={whatsappHref}
          startHref={startHref}
        />
      </div>
    </header>
  );
}
