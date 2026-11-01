"use client";

import * as RadixSelect from "@radix-ui/react-select";
import { forwardRef, useId, type ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { FieldMessages, LabelText, fieldIds } from "./field-parts";
import { CheckIcon, ChevronDownIcon } from "./icons";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectProps = Omit<
  ComponentProps<typeof RadixSelect.Root>,
  "children"
> & {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  id?: string;
  className?: string;
};

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  function Select(
    {
      label,
      options,
      placeholder,
      hint,
      error,
      optional,
      id: idProp,
      className,
      ...rootProps
    },
    ref,
  ) {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const { hintId, errorId, describedBy } = fieldIds(id, hint, error);

    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        <label htmlFor={id} className="text-label text-ink">
          <LabelText
            label={label}
            required={rootProps.required}
            optional={optional}
          />
        </label>
        <RadixSelect.Root {...rootProps}>
          <RadixSelect.Trigger
            ref={ref}
            id={id}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              "flex min-h-12 w-full cursor-pointer items-center justify-between gap-space-2 rounded-md border in-data-portal:rounded-sm border-line-strong bg-surface px-3.5 py-3 text-left text-body text-ink",
              "data-[placeholder]:text-ink-muted",
              "disabled:cursor-not-allowed disabled:bg-neutral-tint disabled:text-ink-muted",
              error && "border-2 border-red-text",
            )}
          >
            <RadixSelect.Value placeholder={placeholder} />
            <RadixSelect.Icon className="text-blue">
              <ChevronDownIcon />
            </RadixSelect.Icon>
          </RadixSelect.Trigger>
          <RadixSelect.Portal>
            <RadixSelect.Content
              position="popper"
              sideOffset={4}
              className="z-50 max-h-[min(20rem,var(--radix-select-content-available-height))] w-(--radix-select-trigger-width) overflow-hidden rounded-md border border-line-strong bg-surface shadow-menu"
            >
              <RadixSelect.Viewport className="p-space-2">
                {options.map((option) => (
                  <RadixSelect.Item
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className={cn(
                      "flex min-h-11 cursor-pointer items-center justify-between gap-space-2 rounded-sm px-space-3 text-body text-ink select-none",
                      "data-[highlighted]:bg-blue-tint data-[state=checked]:font-bold",
                      "data-[disabled]:cursor-not-allowed data-[disabled]:text-ink-muted",
                    )}
                  >
                    <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                    <RadixSelect.ItemIndicator className="text-blue">
                      <CheckIcon />
                    </RadixSelect.ItemIndicator>
                  </RadixSelect.Item>
                ))}
              </RadixSelect.Viewport>
            </RadixSelect.Content>
          </RadixSelect.Portal>
        </RadixSelect.Root>
        <FieldMessages
          hint={hint}
          error={error}
          hintId={hintId}
          errorId={errorId}
        />
      </div>
    );
  },
);
