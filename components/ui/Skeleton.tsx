import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

/** Size it with className to match the layout it stands in for. */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  function Skeleton({ className, ...rest }, ref) {
    return (
      <div
        {...rest}
        ref={ref}
        aria-hidden="true"
        className={cn(
          "rounded-md bg-blue-tint-strong motion-safe:animate-pulse",
          className,
        )}
      />
    );
  },
);
