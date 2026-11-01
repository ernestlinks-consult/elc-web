import Link from "next/link";
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type PaginationProps = Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> & {
  page: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
};

const itemClasses =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-pill px-space-3 text-label";

/** First, last and the pages either side of the current one; null marks a gap. */
function visiblePages(page: number, totalPages: number) {
  const items: (number | null)[] = [];
  for (let candidate = 1; candidate <= totalPages; candidate += 1) {
    const shown =
      candidate === 1 ||
      candidate === totalPages ||
      Math.abs(candidate - page) <= 1;
    if (shown) items.push(candidate);
    else if (items.at(-1) !== null) items.push(null);
  }
  return items;
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  function Pagination(
    {
      page,
      totalPages,
      hrefForPage,
      className,
      "aria-label": ariaLabel = "Pagination",
      ...rest
    },
    ref,
  ) {
    return (
      <nav
        {...rest}
        ref={ref}
        aria-label={ariaLabel}
        className={className}
      >
        <ul className="flex flex-wrap items-center gap-space-1">
          <li>
            {page > 1 ? (
              <Link href={hrefForPage(page - 1)} className={itemClasses}>
                Previous
              </Link>
            ) : (
              <span className={cn(itemClasses, "text-ink-muted")}>
                Previous
              </span>
            )}
          </li>
          {visiblePages(page, totalPages).map((item, index) => (
            <li key={item ?? `gap-${index}`}>
              {item === null ? (
                <span aria-hidden="true" className={cn(itemClasses, "text-ink-muted")}>
                  …
                </span>
              ) : (
                <Link
                  href={hrefForPage(item)}
                  aria-label={`Page ${item}`}
                  aria-current={item === page ? "page" : undefined}
                  className={cn(
                    itemClasses,
                    item === page && "bg-blue text-on-blue no-underline",
                  )}
                >
                  {item}
                </Link>
              )}
            </li>
          ))}
          <li>
            {page < totalPages ? (
              <Link href={hrefForPage(page + 1)} className={itemClasses}>
                Next
              </Link>
            ) : (
              <span className={cn(itemClasses, "text-ink-muted")}>Next</span>
            )}
          </li>
        </ul>
      </nav>
    );
  },
);
