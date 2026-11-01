import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Breadcrumbs, type BreadcrumbItem } from "./Breadcrumbs";

/** Title block for hub, list and content pages. */
export function PageTitle({
  crumbs,
  title,
  lead,
  pattern,
  children,
}: {
  crumbs: BreadcrumbItem[];
  title: string;
  lead?: string;
  /** The brand texture, on the hub page. */
  pattern?: boolean;
  children?: ReactNode;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-line",
        pattern && "bg-blue text-on-blue",
      )}
    >
      {pattern && (
        <div
          aria-hidden="true"
          data-testid="brand-pattern"
          className="absolute inset-0 bg-[url(/brand/elc-pattern-tile.webp)] bg-size-[240px] opacity-25"
        />
      )}
      <div className="relative container flex flex-col gap-space-3 pt-10 pb-space-6">
        <Breadcrumbs items={crumbs} onBlue={pattern} />
        <h1 className="text-h1">{title}</h1>
        {lead && (
          <p className={cn("max-w-180 text-lead", pattern ? "text-on-blue-muted" : "text-ink-muted")}>
            {lead}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}

export type FilterLink = {
  href: string;
  label: string;
  count?: number;
  current: boolean;
};

/**
 * Plain anchors: each filter is a query string that proxy.ts rewrites to a static
 * page, which the client router can't do. They work without JavaScript too.
 */
export function FilterLinks({ label, links }: { label: string; links: FilterLink[] }) {
  return (
    <nav aria-label={label}>
      <ul className="flex flex-wrap gap-space-2">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              aria-current={link.current ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center gap-space-2 rounded-pill border px-space-4 text-label font-bold no-underline",
                link.current
                  ? "border-blue bg-blue text-on-blue"
                  : "border-line-strong bg-surface text-ink",
              )}
            >
              {link.label}
              {link.count !== undefined && <span>{link.count}</span>}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Article and legal text, styled from the outside because it arrives as HTML. */
export const proseClasses =
  "flex max-w-180 flex-col gap-space-3 [&_a]:font-bold [&_blockquote]:border-l-4 [&_blockquote]:border-blue [&_blockquote]:pl-space-4 [&_h2]:pt-space-3 [&_h2]:text-h3 [&_h3]:pt-space-2 [&_h3]:text-h4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6";
