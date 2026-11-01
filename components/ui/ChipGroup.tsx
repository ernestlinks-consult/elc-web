"use client";

import {
  forwardRef,
  useId,
  useState,
  type FieldsetHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { Chip } from "./Chip";
import { FieldMessages, LabelText, fieldIds } from "./field-parts";

export type ChipOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

type ChipGroupOwnProps = Omit<
  FieldsetHTMLAttributes<HTMLFieldSetElement>,
  "onChange" | "defaultValue"
> & {
  legend: string;
  options: ChipOption[];
  name?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
};

type SingleChipGroupProps = ChipGroupOwnProps & {
  multiple?: false;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
};

type MultipleChipGroupProps = ChipGroupOwnProps & {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
};

export type ChipGroupProps = SingleChipGroupProps | MultipleChipGroupProps;

function toArray(value: string | string[] | undefined) {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

export const ChipGroup = forwardRef<HTMLFieldSetElement, ChipGroupProps>(
  function ChipGroup(props, ref) {
    const {
      legend,
      options,
      name: nameProp,
      hint,
      error,
      required,
      optional,
      multiple,
      value,
      defaultValue,
      onChange,
      className,
      id: idProp,
      ...rest
    } = props;

    const generatedId = useId();
    const id = idProp ?? generatedId;
    const name = nameProp ?? id;
    const { hintId, errorId, describedBy } = fieldIds(id, hint, error);

    const [internal, setInternal] = useState(() => toArray(defaultValue));
    const selected = value === undefined ? internal : toArray(value);

    function handleChange(optionValue: string, checked: boolean) {
      if (multiple) {
        const next = checked
          ? [...selected, optionValue]
          : selected.filter((item) => item !== optionValue);
        setInternal(next);
        (onChange as MultipleChipGroupProps["onChange"])?.(next);
      } else {
        setInternal([optionValue]);
        (onChange as SingleChipGroupProps["onChange"])?.(optionValue);
      }
    }

    return (
      <fieldset
        {...rest}
        ref={ref}
        id={id}
        // aria-required and aria-invalid are only valid on a radiogroup.
        role={multiple ? undefined : "radiogroup"}
        aria-required={!multiple && required ? true : undefined}
        aria-invalid={!multiple && error ? true : undefined}
        aria-describedby={describedBy}
        className={cn("flex min-w-0 flex-col gap-1.5", className)}
      >
        <legend className="mb-1.5 text-label text-ink">
          <LabelText label={legend} required={required} optional={optional} />
        </legend>
        <div className="flex flex-wrap gap-space-2">
          {options.map((option) => (
            <Chip
              key={option.value}
              name={name}
              value={option.value}
              label={option.label}
              multiple={multiple}
              disabled={option.disabled}
              required={!multiple && required}
              checked={selected.includes(option.value)}
              onChange={(event) =>
                handleChange(option.value, event.target.checked)
              }
            />
          ))}
        </div>
        <FieldMessages
          hint={hint}
          error={error}
          hintId={hintId}
          errorId={errorId}
        />
      </fieldset>
    );
  },
);
