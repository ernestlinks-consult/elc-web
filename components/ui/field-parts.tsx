import type { ReactNode } from "react";

// Internal pieces shared by Field, Select and ChipGroup.

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
}: {
  label: ReactNode;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <>
      {label}
      {required && (
        <span className="text-red-text" aria-hidden="true">
          {" *"}
        </span>
      )}
      {optional && (
        <span className="font-medium text-ink-muted"> (optional)</span>
      )}
    </>
  );
}

export function FieldMessages({
  hint,
  error,
  hintId,
  errorId,
}: {
  hint?: string;
  error?: string;
  hintId?: string;
  errorId?: string;
}) {
  return (
    <>
      {hint && (
        <span id={hintId} className="text-caption font-normal text-ink-muted">
          {hint}
        </span>
      )}
      {error && (
        <span
          id={errorId}
          role="alert"
          className="text-body-sm font-bold text-red-text"
        >
          {error}
        </span>
      )}
    </>
  );
}
