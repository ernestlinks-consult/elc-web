"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/app/(portal)/portal/auth-actions";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { roleLabels, seesAllLeads, type StaffRole } from "@/lib/auth/access";

export type PortalNavProps = {
  fullName: string;
  role: StaffRole;
  newLeads: number;
};

const itemClasses =
  "flex min-h-11 items-center justify-between gap-space-2 rounded-sm px-3 font-medium text-on-blue no-underline";

function NavItems({
  role,
  newLeads,
  onNavigate,
  tone,
}: {
  role: StaffRole;
  newLeads: number;
  onNavigate?: () => void;
  tone: "deep" | "light";
}) {
  const pathname = usePathname();
  const items = [
    { href: "/portal", label: "Dashboard" },
    { href: "/portal/leads", label: "Leads", badge: newLeads },
    ...(seesAllLeads(role)
      ? [
          { href: "/portal/messages", label: "Messages" },
          { href: "/portal/subscribers", label: "Subscribers" },
        ]
      : []),
  ];

  return (
    <ul className="flex flex-col gap-1">
      {items.map(({ href, label, badge }) => {
        const current =
          href === "/portal" ? pathname === href : pathname.startsWith(href);

        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={current ? "page" : undefined}
              className={cn(
                itemClasses,
                tone === "light" && "text-ink",
                current && "bg-surface font-extrabold text-blue",
              )}
            >
              {label}
              {badge ? (
                <span className="rounded-pill bg-red px-2 text-caption text-on-blue">
                  {badge} new
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function SignOut({ tone }: { tone: "deep" | "light" }) {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className={cn(
          "min-h-11 cursor-pointer rounded-sm px-3 font-bold underline",
          tone === "deep" ? "text-on-blue" : "text-blue",
        )}
      >
        Sign out
      </button>
    </form>
  );
}

/** The sidebar from 820px; a top bar with a menu below it. */
export function PortalNav({ fullName, role, newLeads }: PortalNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="flex w-62 shrink-0 flex-col gap-space-5 bg-blue-deep p-space-4 text-on-blue max-phone:hidden">
        <Link
          href="/portal"
          aria-label="ELC staff portal home"
          className="flex flex-col gap-1 no-underline"
        >
          <Image
            src="/brand/web-elc-logo-vertical-stack-white.svg"
            alt=""
            width={120}
            height={68}
            loading="eager"
          />
          <span className="text-eyebrow text-on-blue-muted">Portal</span>
        </Link>
        <nav aria-label="Portal" className="flex-1">
          <NavItems role={role} newLeads={newLeads} tone="deep" />
        </nav>
        <div className="flex flex-col gap-space-2 border-t border-line-on-deep pt-space-3">
          <div className="flex flex-col px-3">
            <strong>{fullName}</strong>
            <span className="text-body-sm text-on-blue-muted">{roleLabels[role]}</span>
          </div>
          <SignOut tone="deep" />
        </div>
      </aside>

      <header className="flex items-center justify-between gap-space-3 bg-blue-deep px-space-4 py-2 text-on-blue phone:hidden">
        <Link
          href="/portal"
          aria-label="ELC staff portal home"
          className="flex items-center"
        >
          <Image
            src="/brand/web-elc-logo-vertical-stack-white.svg"
            alt=""
            width={72}
            height={41}
            loading="eager"
          />
        </Link>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="min-h-11 cursor-pointer rounded-pill border-2 border-on-blue px-5 font-extrabold text-on-blue">
            Menu
          </DialogTrigger>
          <DialogContent
            title="Menu"
            closeLabel="Close menu"
            className="top-0 right-0 left-auto h-dvh max-h-dvh w-full max-w-110 translate-x-0 translate-y-0 justify-start rounded-none p-space-5"
          >
            <nav aria-label="Portal menu">
              <NavItems
                role={role}
                newLeads={newLeads}
                tone="light"
                onNavigate={() => setOpen(false)}
              />
            </nav>
            <div className="flex flex-col gap-space-2 border-t border-line pt-space-3">
              <div className="flex flex-col px-3">
                <strong>{fullName}</strong>
                <span className="text-body-sm text-ink-muted">{roleLabels[role]}</span>
              </div>
              <SignOut tone="light" />
            </div>
          </DialogContent>
        </Dialog>
      </header>
    </>
  );
}
