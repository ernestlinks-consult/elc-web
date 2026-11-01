"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button, Dialog, DialogContent, DialogTrigger } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { NavItem, NavLink } from "@/lib/site-config";
import { isCurrentPath } from "./nav";

export type MobileMenuProps = {
  nav: NavItem[];
  whatsappHref: string;
  startHref: string;
};

function MenuLink({
  link,
  pathname,
  onNavigate,
}: {
  link: NavLink;
  pathname: string;
  onNavigate: () => void;
}) {
  const current = isCurrentPath(pathname, link.href);

  return (
    <Link
      href={link.href}
      aria-current={current ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        "flex min-h-11 items-center rounded-sm text-body font-medium text-ink no-underline",
        current && "font-extrabold text-blue",
      )}
    >
      {link.label}
    </Link>
  );
}

/** Full-height panel under 820px. Radix locks scroll and traps focus. */
export function MobileMenu({ nav, whatsappHref, startHref }: MobileMenuProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="phone:hidden">
          Menu
        </Button>
      </DialogTrigger>
      <DialogContent
        title="Menu"
        closeLabel="Close menu"
        className="top-0 right-0 left-auto h-dvh max-h-dvh w-full max-w-110 translate-x-0 translate-y-0 justify-start rounded-none p-space-5"
      >
        <div className="flex flex-col gap-space-3">
          <Button href={startHref} block size="lg" onClick={close}>
            Start online
          </Button>
          <Button
            href={whatsappHref}
            variant="secondary"
            block
            size="lg"
            onClick={close}
          >
            WhatsApp
          </Button>
        </div>
        <nav aria-label="Menu">
          <ul className="flex flex-col gap-space-2">
            {nav.map((item) =>
              item.type === "link" ? (
                <li key={item.href}>
                  <MenuLink
                    link={item}
                    pathname={pathname}
                    onNavigate={close}
                  />
                </li>
              ) : (
                <li key={item.key} className="flex flex-col pt-space-2">
                  <h3 className="text-eyebrow text-ink-muted">{item.label}</h3>
                  <ul>
                    {item.links.map((link) => (
                      <li key={link.href}>
                        <MenuLink
                          link={link}
                          pathname={pathname}
                          onNavigate={close}
                        />
                      </li>
                    ))}
                  </ul>
                </li>
              ),
            )}
          </ul>
        </nav>
      </DialogContent>
    </Dialog>
  );
}
