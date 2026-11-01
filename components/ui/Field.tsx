import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type Ref,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";
import {
  FieldMessages,
  LabelText,
  fieldIds,
  type FieldSurface,
} from "./field-parts";

type FieldOwnProps = {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  /** "deep" for blue-deep backgrounds, where red-text is not allowed. */
  surface?: FieldSurface;
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
  {
    label,
    hint,
    error,
    optional,
    surface = "light",
    className,
    id: idProp,
    ...rest
  },
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
  const onDeep = surface === "deep";
  const controlClasses = cn(
    "w-full rounded-md border px-3.5 py-3 text-body disabled:cursor-not-allowed disabled:bg-neutral-tint disabled:text-ink-muted",
    onDeep
      ? "border-line-on-deep bg-blue-deep text-on-blue placeholder:text-on-blue-muted"
      : "border-line-strong bg-surface text-ink placeholder:text-ink-muted",
    error && (onDeep ? "border-2 border-on-blue" : "border-2 border-red-text"),
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
      <label
        htmlFor={id}
        className={cn("text-label", onDeep ? "text-on-blue" : "text-ink")}
      >
        <LabelText
          label={label}
          required={rest.required}
          optional={optional}
          surface={surface}
        />
      </label>
      {control}
      <FieldMessages
        hint={hint}
        error={error}
        hintId={hintId}
        errorId={errorId}
        surface={surface}
      />
    </div>
  );
});
