import Link from "next/link";
import { cn } from "@/lib/cn";

export type BreadcrumbItem = {
  label: string;
  /** Leave off the last item: it is the current page. */
  href?: string;
};

export type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
  /** For blue heroes. */
  onBlue?: boolean;
};

/** Pages below the home page only. An empty list renders nothing. */
export function Breadcrumbs({ items, className, onBlue }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol
        className={cn(
          "flex flex-wrap items-center text-body-sm",
          onBlue ? "text-on-blue-muted" : "text-ink-muted",
        )}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center">
              {isLast ? (
                <span
                  aria-current="page"
                  className={cn("font-bold", onBlue ? "text-on-blue" : "text-ink")}
                >
                  {item.label}
                </span>
              ) : (
                <>
                  <Link
                    href={item.href ?? "/"}
                    className={cn(
                      "inline-flex min-h-11 items-center",
                      onBlue && "text-on-blue",
                    )}
                  >
                    {item.label}
                  </Link>
                  <span aria-hidden="true" className="px-space-2">
                    /
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
