import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type EmptyStateProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  /** One sentence. */
  message: string;
  /** One action, usually a Button. */
  action: ReactNode;
};

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  function EmptyState({ message, action, className, ...rest }, ref) {
    return (
      <div
        {...rest}
        ref={ref}
        className={cn(
          "flex flex-col items-center gap-space-4 rounded-lg bg-blue-tint p-space-6 text-center",
          className,
        )}
      >
        <p className="text-body text-ink">{message}</p>
        {action}
      </div>
    );
  },
);
