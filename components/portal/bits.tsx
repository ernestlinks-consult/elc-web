import Link from "next/link";
import type { ReactNode } from "react";
import { Badge, type BadgeTone } from "@/components/ui";
import { cn } from "@/lib/cn";
import { statusLabels, type LeadStatus } from "@/lib/portal/filters";
import { exactTime, relativeTime } from "@/lib/portal/time";

const statusTones: Record<LeadStatus, BadgeTone> = {
  new: "new",
  contacted: "blue",
  started: "warning",
  paid: "success",
  closed: "neutral",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={statusTones[status as LeadStatus] ?? "neutral"}>
      {statusLabels[status as LeadStatus] ?? status}
    </Badge>
  );
}

export function OverdueBadge() {
  return <Badge tone="red">Overdue</Badge>;
}

export function PageHeader({
  title,
  note,
  actions,
}: {
  title: string;
  note?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-space-3">
      <div>
        <h1 className="text-h2">{title}</h1>
        {note && <p className="text-ink-muted">{note}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Panel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col gap-space-3 rounded-lg border border-line bg-surface p-space-4",
        className,
      )}
    >
      {children}
    </section>
  );
}

/** Relative, with the exact time on hover or keyboard focus. */
export function TimeAgo({ value, now }: { value: string; now: Date }) {
  const exact = exactTime(value);

  return (
    <span className="group relative inline-block" tabIndex={0}>
      <span aria-hidden="true">{relativeTime(value, now)}</span>
      <span className="sr-only">{exact}</span>
      <span
        aria-hidden="true"
        className="absolute bottom-full left-0 z-20 hidden rounded-sm bg-ink px-2 py-1 text-caption whitespace-nowrap text-on-blue group-hover:block group-focus:block"
      >
        {exact}
      </span>
    </span>
  );
}

/**
 * A plain anchor, never next/link: the router would prefetch it, running the export
 * and writing an audit entry for something nobody asked for.
 */
export function ExportLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      className="inline-flex min-h-11 items-center rounded-pill border-2 border-blue bg-surface px-5 text-label font-extrabold text-blue no-underline"
    >
      Export CSV
    </a>
  );
}

export type TabLink = {
  href: string;
  label: string;
  count?: number;
  current: boolean;
};

export function TabLinks({ label, tabs }: { label: string; tabs: TabLink[] }) {
  return (
    <nav aria-label={label}>
      <ul className="flex flex-wrap gap-space-2">
        {tabs.map((tab) => (
          <li key={tab.href}>
            <Link
              href={tab.href}
              aria-current={tab.current ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center gap-space-2 rounded-pill border px-space-4 text-label font-bold no-underline",
                tab.current
                  ? "border-blue bg-blue text-on-blue"
                  : "border-line-strong bg-surface text-ink",
              )}
            >
              {tab.label}
              {tab.count !== undefined && <span>{tab.count}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
