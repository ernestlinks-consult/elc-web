import Link from "next/link";
import { forwardRef, type ReactNode, type Ref } from "react";
import { cn } from "@/lib/cn";

export type CardTone = "light" | "tint" | "blue";

export type CardProps = {
  title: string;
  eyebrow?: string;
  /** Last line, ending with → or the WhatsApp keyword. */
  action?: string;
  /** Makes the whole card the link. */
  href?: string;
  tone?: CardTone;
  children?: ReactNode;
  className?: string;
};

const toneClasses: Record<CardTone, string> = {
  light: "border border-line bg-surface text-ink",
  tint: "bg-blue-tint text-ink",
  blue: "bg-blue text-on-blue",
};

export const Card = forwardRef<HTMLAnchorElement | HTMLDivElement, CardProps>(
  function Card(
    { title, eyebrow, action, href, tone = "light", children, className },
    ref,
  ) {
    const onBlue = tone === "blue";
    const classes = cn(
      "flex max-w-80 min-w-55 flex-col gap-2.5 rounded-lg p-space-5 no-underline",
      toneClasses[tone],
      href && tone === "light" && "hover:border-line-strong",
      className,
    );
    const content = (
      <>
        {eyebrow && (
          <span
            className={cn(
              "text-eyebrow",
              onBlue ? "text-on-blue-muted" : "text-blue",
            )}
          >
            {eyebrow}
          </span>
        )}
        <strong className="text-h4">{title}</strong>
        {children && (
          <span
            className={cn(
              "text-body-sm",
              onBlue ? "text-on-blue-muted" : "text-ink-muted",
            )}
          >
            {children}
          </span>
        )}
        {action && (
          <span
            className={cn(
              "mt-auto text-label font-extrabold",
              onBlue ? "text-on-blue" : "text-blue",
            )}
          >
            {action}
          </span>
        )}
      </>
    );

    if (href) {
      return (
        <Link
          ref={ref as Ref<HTMLAnchorElement>}
          href={href}
          className={classes}
        >
          {content}
        </Link>
      );
    }

    return (
      <div ref={ref as Ref<HTMLDivElement>} className={classes}>
        {content}
      </div>
    );
  },
);
