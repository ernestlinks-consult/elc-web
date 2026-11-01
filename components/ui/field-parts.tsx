import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// Internal pieces shared by Field, Select and ChipGroup.

export type FieldSurface = "light" | "deep";

export function fieldIds(id: string, hint?: string, error?: string) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-err` : undefined;
  return {
    hintId,
    errorId,
    describedBy: [hintId, errorId].filter(Boolean).join(" ") || undefined,
  };
}

export function LabelText({
  label,
  required,
  optional,
  surface = "light",
}: {
  label: ReactNode;
  required?: boolean;
  optional?: boolean;
  surface?: FieldSurface;
}) {
  const onDeep = surface === "deep";

  return (
    <>
      {label}
      {required && (
        <span
          className={onDeep ? "text-on-blue" : "text-red-text"}
          aria-hidden="true"
        >
          {" *"}
        </span>
      )}
      {optional && (
        <span
          className={cn(
            "font-medium",
            onDeep ? "text-on-blue-muted" : "text-ink-muted",
          )}
        >
          {" "}
          (optional)
        </span>
      )}
    </>
  );
}

export function FieldMessages({
  hint,
  error,
  hintId,
  errorId,
  surface = "light",
}: {
  hint?: string;
  error?: string;
  hintId?: string;
  errorId?: string;
  surface?: FieldSurface;
}) {
  const onDeep = surface === "deep";

  return (
    <>
      {hint && (
        <span
          id={hintId}
          className={cn(
            "text-caption font-normal",
            onDeep ? "text-on-blue-muted" : "text-ink-muted",
          )}
        >
          {hint}
        </span>
      )}
      {error && (
        <span
          id={errorId}
          role="alert"
          className={cn(
            "text-body-sm font-bold",
            onDeep ? "text-on-blue" : "text-red-text",
          )}
        >
          {error}
        </span>
      )}
    </>
  );
}
