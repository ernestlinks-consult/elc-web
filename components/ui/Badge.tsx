import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone =
  | "neutral"
  | "blue"
  | "solid"
  | "red"
  | "new"
  | "success"
  | "warning";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-neutral-tint text-ink-muted",
  blue: "bg-blue-tint-strong text-blue",
  solid: "bg-blue text-on-blue",
  red: "bg-red text-on-blue",
  new: "bg-red-tint text-red-text",
  success: "bg-success-tint text-success",
  warning: "bg-warning-tint text-warning",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { tone = "neutral", className, ...rest },
  ref,
) {
  return (
    <span
      {...rest}
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-pill px-2.5 py-1.5 text-[12px] leading-none font-extrabold tracking-[0.04em] uppercase",
        toneClasses[tone],
        className,
      )}
    />
  );
});
