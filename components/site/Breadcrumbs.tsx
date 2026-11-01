import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  /** Leave off the last item: it is the current page. */
  href?: string;
};

export type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

/** Pages below the home page only. An empty list renders nothing. */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center text-body-sm text-ink-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center">
              {isLast ? (
                <span aria-current="page" className="font-bold text-ink">
                  {item.label}
                </span>
              ) : (
                <>
                  <Link
                    href={item.href ?? "/"}
                    className="inline-flex min-h-11 items-center"
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
