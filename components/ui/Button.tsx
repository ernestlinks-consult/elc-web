"use client";

import Link from "next/link";
import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "on-blue"
  | "outline-on-blue"
  | "red"
  | "ghost";
export type ButtonSize = "md" | "lg";

type ButtonOwnProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  loading?: boolean;
  /** Replaces the label while loading, e.g. "Saving…". */
  loadingText?: ReactNode;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

type NativeButtonProps = ButtonOwnProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type LinkButtonProps = ButtonOwnProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    disabled?: boolean;
  };

export type ButtonProps = NativeButtonProps | LinkButtonProps;

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-blue text-on-blue hover:bg-blue-deep",
  secondary: "border-blue bg-surface text-blue hover:bg-blue-tint",
  "on-blue": "bg-surface text-blue hover:bg-blue-tint",
  "outline-on-blue": "border-on-blue bg-transparent text-on-blue",
  red: "bg-red text-on-blue",
  ghost: "bg-transparent px-space-2 text-blue underline",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "min-h-11 px-5 text-label font-extrabold",
  lg: "min-h-13 px-6.5 text-body font-extrabold",
};

const inactiveClasses =
  "cursor-not-allowed border-line bg-line text-ink-muted no-underline";

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(function Button(
  {
    variant = "primary",
    size = "md",
    block = false,
    loading = false,
    loadingText,
    leadingIcon,
    trailingIcon,
    className,
    children,
    ...rest
  },
  ref,
) {
  const inactive = loading || Boolean(rest.disabled);
  const classes = cn(
    "inline-flex cursor-pointer items-center justify-center gap-space-2 rounded-pill border-2 border-transparent no-underline",
    sizeClasses[size],
    block && "flex w-full",
    inactive ? inactiveClasses : variantClasses[variant],
    className,
  );
  const content = (
    <>
      {leadingIcon && <span aria-hidden="true">{leadingIcon}</span>}
      {loading && loadingText ? loadingText : children}
      {trailingIcon && <span aria-hidden="true">{trailingIcon}</span>}
    </>
  );

  if (rest.href !== undefined) {
    const { href, disabled, ...anchorProps } = rest;
    void disabled;

    // A link with no href leaves the tab order, which is what disabled means here.
    if (inactive) {
      return (
        <a
          {...anchorProps}
          ref={ref as Ref<HTMLAnchorElement>}
          role="link"
          aria-disabled="true"
          aria-busy={loading || undefined}
          className={classes}
        >
          {content}
        </a>
      );
    }

    return (
      <Link
        {...anchorProps}
        ref={ref as Ref<HTMLAnchorElement>}
        href={href}
        className={classes}
      >
        {content}
      </Link>
    );
  }

  const { disabled, onClick, type = "button", ...buttonProps } = rest;

  // aria-disabled, not disabled: focus stays on the button while it loads.
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  }

  return (
    <button
      {...buttonProps}
      ref={ref as Ref<HTMLButtonElement>}
      type={type}
      disabled={disabled}
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      onClick={handleClick}
      className={classes}
    >
      {content}
    </button>
  );
});
