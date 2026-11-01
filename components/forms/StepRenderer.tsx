"use client";

import Link from "next/link";
import {
  Controller,
  type Control,
  type ControllerRenderProps,
} from "react-hook-form";
import { ChipGroup, Field, Select } from "@/components/ui";
import { cn } from "@/lib/cn";
import { isInputField, type Field as FormField, type InputField } from "@/lib/forms/types";

export type StepRendererProps = {
  stepKey: string;
  fields: FormField[];
  control: Control;
  /** Errors returned by the server when the browser posted without JavaScript. */
  serverErrors?: Record<string, string>;
  priceLabels: Record<string, string>;
  privacyHref: string;
};

export function fieldId(stepKey: string, key: string) {
  return `${stepKey}-${key}`;
}

function isWide(field: FormField) {
  if (!isInputField(field)) return true;
  if (field.full || field.kind === "textarea") return true;
  return field.kind === "checkboxes" && field.options.length > 4;
}

function optionsFor(
  field: Extract<InputField, { options: string[] }>,
  priceLabels: Record<string, string>,
) {
  return field.options.map((option) => {
    const priceKey = field.optionPrices?.[option];
    const price = priceKey ? priceLabels[priceKey] : undefined;
    return { value: option, label: price ? `${option} · ${price}` : option };
  });
}

function renderInput({
  field,
  bound,
  id,
  error,
  priceLabels,
  privacyHref,
}: {
  field: InputField;
  bound: ControllerRenderProps;
  id: string;
  error?: string;
  priceLabels: Record<string, string>;
  privacyHref: string;
}) {
  const shared = {
    id,
    required: field.required,
    optional: field.optional,
    hint: field.hint,
    error,
  };

  switch (field.kind) {
    case "radio":
    case "checkboxes": {
      const options = optionsFor(field, priceLabels);
      const group = {
        id,
        legend: field.label,
        name: field.key,
        options,
        required: field.required,
        optional: field.optional,
        hint: field.hint,
        error,
        // RHF focuses the first error; a fieldset cannot take focus itself.
        ref: (element: HTMLFieldSetElement | null) =>
          bound.ref(
            element && {
              focus: () => element.querySelector("input")?.focus(),
            },
          ),
      };

      return field.kind === "radio" ? (
        <ChipGroup
          {...group}
          value={bound.value as string}
          onChange={bound.onChange}
        />
      ) : (
        <ChipGroup
          {...group}
          multiple
          value={bound.value as string[]}
          onChange={bound.onChange}
        />
      );
    }
    case "select":
      return (
        <Select
          {...shared}
          ref={bound.ref}
          label={field.label}
          placeholder="Choose…"
          options={optionsFor(field, priceLabels)}
          value={(bound.value as string) || undefined}
          onValueChange={bound.onChange}
        />
      );
    case "textarea":
      return (
        <Field
          {...shared}
          multiline
          rows={3}
          label={field.label}
          placeholder={field.placeholder}
          name={bound.name}
          ref={bound.ref}
          value={bound.value as string}
          onChange={bound.onChange}
          onBlur={bound.onBlur}
        />
      );
    case "tick":
      return (
        <div className="flex flex-col gap-1">
          <label className="flex min-h-11 items-start gap-3">
            <input
              id={id}
              name={bound.name}
              type="checkbox"
              ref={bound.ref}
              checked={Boolean(bound.value)}
              onChange={(event) => bound.onChange(event.target.checked)}
              onBlur={bound.onBlur}
              aria-required={field.required ? true : undefined}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-err` : undefined}
              className="mt-0.5 size-5.5 shrink-0 accent-blue"
            />
            <span>
              {field.label}
              {field.required && (
                <span aria-hidden="true" className="text-red-text">
                  {" *"}
                </span>
              )}
            </span>
          </label>
          {field.privacyLink && (
            <Link
              href={privacyHref}
              className="inline-flex min-h-11 items-center self-start pl-8.5"
            >
              Privacy notice
            </Link>
          )}
          {error && (
            <span
              id={`${id}-err`}
              role="alert"
              className="text-body-sm font-bold text-red-text"
            >
              {error}
            </span>
          )}
        </div>
      );
    default:
      return (
        <Field
          {...shared}
          type={field.kind}
          label={field.label}
          placeholder={"placeholder" in field ? field.placeholder : undefined}
          name={bound.name}
          ref={bound.ref}
          value={bound.value as string}
          onChange={bound.onChange}
          onBlur={bound.onBlur}
        />
      );
  }
}

export function StepRenderer({
  stepKey,
  fields,
  control,
  serverErrors,
  priceLabels,
  privacyHref,
}: StepRendererProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-x-4 gap-y-4.5">
      {fields.map((field) => (
        <div
          key={isInputField(field) ? field.key : field.label}
          className={cn("min-w-0", isWide(field) && "col-span-full")}
        >
          {field.kind === "heading" && (
            <h3 className="mt-2.5 border-t border-line pt-3.5 text-h4">
              {field.label}
            </h3>
          )}
          {field.kind === "note" && (
            <p className="rounded-md bg-blue-tint px-space-4 py-3.5">
              {field.label}
            </p>
          )}
          {isInputField(field) && (
            <Controller
              name={field.key}
              control={control}
              render={({ field: bound, fieldState }) =>
                renderInput({
                  field,
                  bound,
                  id: fieldId(stepKey, field.key),
                  error: fieldState.error?.message ?? serverErrors?.[field.key],
                  priceLabels,
                  privacyHref,
                })
              }
            />
          )}
        </div>
      ))}
    </div>
  );
}
