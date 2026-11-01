import {
  forwardRef,
  useId,
  type HTMLAttributes,
  type TableHTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

export type TableProps = TableHTMLAttributes<HTMLTableElement> & {
  /** Names the table and its scroll area for screen readers. */
  caption: string;
  captionHidden?: boolean;
  containerClassName?: string;
};

export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { caption, captionHidden, containerClassName, className, children, ...rest },
  ref,
) {
  const captionId = useId();

  return (
    // Focusable so keyboard users can scroll it on phones.
    <div
      role="region"
      aria-labelledby={captionId}
      tabIndex={0}
      className={cn("w-full overflow-x-auto", containerClassName)}
    >
      <table
        {...rest}
        ref={ref}
        className={cn(
          "w-full min-w-max border-collapse text-left text-body-sm text-ink",
          className,
        )}
      >
        <caption
          id={captionId}
          className={cn(
            "pb-space-3 text-left text-label text-ink",
            captionHidden && "sr-only",
          )}
        >
          {caption}
        </caption>
        {children}
      </table>
    </div>
  );
});

export const TableHead = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(function TableHead({ className, ...rest }, ref) {
  return (
    <thead
      {...rest}
      ref={ref}
      className={cn("border-b border-line-strong", className)}
    />
  );
});

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(function TableBody(props, ref) {
  return <tbody {...props} ref={ref} />;
});

export type TableRowProps = HTMLAttributes<HTMLTableRowElement> & {
  selected?: boolean;
};

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  function TableRow({ selected, className, ...rest }, ref) {
    return (
      <tr
        {...rest}
        ref={ref}
        className={cn(
          "border-b border-line last:border-b-0",
          selected && "bg-blue-tint",
          className,
        )}
      />
    );
  },
);

export const TableHeaderCell = forwardRef<
  HTMLTableCellElement,
  ThHTMLAttributes<HTMLTableCellElement>
>(function TableHeaderCell({ className, scope = "col", ...rest }, ref) {
  return (
    <th
      {...rest}
      ref={ref}
      scope={scope}
      className={cn("px-space-3 py-space-3 text-label", className)}
    />
  );
});

export const TableCell = forwardRef<
  HTMLTableCellElement,
  TdHTMLAttributes<HTMLTableCellElement>
>(function TableCell({ className, ...rest }, ref) {
  return (
    <td
      {...rest}
      ref={ref}
      className={cn("px-space-3 py-space-3", className)}
    />
  );
});
