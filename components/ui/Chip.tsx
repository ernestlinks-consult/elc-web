import {
  forwardRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

export type ChipProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: ReactNode;
  /** Checkbox when true, radio otherwise. Give radios the same name. */
  multiple?: boolean;
};

export const Chip = forwardRef<HTMLInputElement, ChipProps>(function Chip(
  { label, multiple = false, className, ...rest },
  ref,
) {
  return (
    <label
      className={cn(
        "inline-flex min-h-11 cursor-pointer items-center gap-space-2 rounded-pill border border-line-strong bg-surface px-space-4 text-body-sm font-semibold text-ink",
        "has-[:checked:enabled]:border-blue has-[:checked:enabled]:bg-blue has-[:checked:enabled]:text-on-blue",
        "has-[:disabled]:cursor-not-allowed has-[:disabled]:border-line has-[:disabled]:bg-line has-[:disabled]:text-ink-muted",
        // On a selected chip the input's own ring would vanish into the blue fill.
        "has-[:focus-visible]:shadow-focus-ring",
        className,
      )}
    >
      <input
        {...rest}
        ref={ref}
        type={multiple ? "checkbox" : "radio"}
        className="m-0 size-4 accent-blue checked:accent-surface"
      />
      <span>{label}</span>
    </label>
  );
});

export type FilterChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  pressed: boolean;
};

/** Filter tabs on list pages: looks like a Chip, behaves like a toggle button. */
export const FilterChip = forwardRef<HTMLButtonElement, FilterChipProps>(
  function FilterChip({ pressed, className, type = "button", ...rest }, ref) {
    return (
      <button
        {...rest}
        ref={ref}
        type={type}
        aria-pressed={pressed}
        className={cn(
          "inline-flex min-h-11 cursor-pointer items-center rounded-pill border border-line-strong bg-surface px-space-4 text-body-sm font-semibold text-ink",
          "aria-pressed:border-blue aria-pressed:bg-blue aria-pressed:text-on-blue",
          "disabled:cursor-not-allowed disabled:border-line disabled:bg-line disabled:text-ink-muted",
          className,
        )}
      />
    );
  },
);
