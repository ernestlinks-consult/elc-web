import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type Ref,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";
import { FieldMessages, LabelText, fieldIds } from "./field-parts";

type FieldOwnProps = {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
};

type InputFieldProps = FieldOwnProps &
  InputHTMLAttributes<HTMLInputElement> & { multiline?: false };

type TextareaFieldProps = FieldOwnProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & { multiline: true };

export type FieldProps = InputFieldProps | TextareaFieldProps;

export const Field = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  FieldProps
>(function Field(
  { label, hint, error, optional, className, id: idProp, ...rest },
  ref,
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const { hintId, errorId, describedBy } = fieldIds(id, hint, error);

  const shared = {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
  };
  const controlClasses = cn(
    "w-full rounded-md border border-line-strong bg-surface px-3.5 py-3 text-body text-ink placeholder:text-ink-muted disabled:cursor-not-allowed disabled:bg-neutral-tint disabled:text-ink-muted",
    error && "border-2 border-red-text",
  );

  let control;
  if (rest.multiline) {
    const { multiline, rows = 4, ...textareaProps } = rest;
    void multiline;
    control = (
      <textarea
        {...shared}
        {...textareaProps}
        ref={ref as Ref<HTMLTextAreaElement>}
        rows={rows}
        className={cn(controlClasses, "min-h-28 resize-y")}
      />
    );
  } else {
    const { multiline, type = "text", ...inputProps } = rest;
    void multiline;
    control = (
      <input
        {...shared}
        {...inputProps}
        ref={ref as Ref<HTMLInputElement>}
        type={type}
        className={cn(controlClasses, "min-h-12")}
      />
    );
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-label text-ink">
        <LabelText label={label} required={rest.required} optional={optional} />
      </label>
      {control}
      <FieldMessages
        hint={hint}
        error={error}
        hintId={hintId}
        errorId={errorId}
      />
    </div>
  );
});
