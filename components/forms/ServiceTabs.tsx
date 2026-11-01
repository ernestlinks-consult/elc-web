import { cn } from "@/lib/cn";
import { serviceForms, serviceKeys, type ServiceKey } from "@/lib/forms";

export type ServiceTabsProps = {
  current: ServiceKey;
};

/**
 * Plain anchors, not next/link: the client router does not apply the rewrite that
 * maps ?service= to each static page. Deep-links and works without JavaScript.
 */
export function ServiceTabs({ current }: ServiceTabsProps) {
  return (
    <nav aria-label="Choose a service">
      <ul className="flex flex-wrap gap-space-2">
        {serviceKeys.map((key) => {
          const active = key === current;
          return (
            <li key={key}>
              <a
                href={`/start?service=${key}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-pill border px-4.5 text-label font-extrabold no-underline",
                  active
                    ? "border-blue bg-blue text-on-blue"
                    : "border-line-strong bg-surface text-ink",
                )}
              >
                {serviceForms[key].name}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
