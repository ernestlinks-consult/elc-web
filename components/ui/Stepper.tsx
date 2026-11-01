import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type StepperProps = HTMLAttributes<HTMLDivElement> & {
  steps: string[];
  /** Zero-based index of the current step. */
  current: number;
  title?: string;
  note?: string;
};

export const Stepper = forwardRef<HTMLDivElement, StepperProps>(
  function Stepper({ steps, current, title, note, className, ...rest }, ref) {
    const percent = steps.length
      ? Math.round(((current + 1) / steps.length) * 100)
      : 0;

    return (
      <div
        {...rest}
        ref={ref}
        className={cn("flex max-w-160 flex-col gap-space-3", className)}
      >
        <div className="flex flex-wrap justify-between gap-space-3">
          <strong aria-live="polite" className="text-label text-blue">
            {title && `${title} · `}Step {current + 1} of {steps.length}
          </strong>
          {note && <span className="text-body-sm text-ink-muted">{note}</span>}
        </div>
        <div
          aria-hidden="true"
          className="h-2 overflow-hidden rounded-pill bg-blue-tint-strong"
        >
          <div
            className="h-full rounded-pill bg-blue"
            style={{ width: `${percent}%` }}
          />
        </div>
        <ol
          aria-label={title ? `${title} steps` : "Steps"}
          className="flex flex-wrap gap-x-3.5 gap-y-1.5"
        >
          {steps.map((step, index) => {
            const done = index < current;
            const isCurrent = index === current;
            return (
              <li
                key={step}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "text-caption font-semibold",
                  done && "text-success",
                  isCurrent && "font-extrabold text-blue",
                  !done && !isCurrent && "text-ink-muted",
                )}
              >
                {done ? (
                  <>
                    <span aria-hidden="true">✓ </span>
                    <span className="sr-only">Completed: </span>
                  </>
                ) : (
                  `${index + 1}. `
                )}
                {step}
              </li>
            );
          })}
        </ol>
      </div>
    );
  },
);
