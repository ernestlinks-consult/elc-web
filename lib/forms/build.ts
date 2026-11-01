import { z } from "zod";
import { normalizePhone, phoneExample } from "./phone";
import {
  isInputField,
  type Field,
  type InputField,
  type Step,
} from "./types";

// One schema per step, built from the same field list the form renders, and run
// on both client and server. Inputs arrive as strings; empty means "not given".

const isBlank = (value: unknown) =>
  value === undefined || value === null || value === "";

const emptyToUndefined = (value: unknown) =>
  isBlank(value) ? undefined : value;

function defaultRequiredMessage(field: InputField) {
  if (field.requiredMessage) return field.requiredMessage;
  if (field.kind === "radio" || field.kind === "select") return "Choose one.";
  if (field.kind === "checkboxes") return "Choose at least one.";
  return `Enter your ${field.label.toLowerCase()}.`;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function filledSchema(field: InputField): z.ZodType {
  const required = defaultRequiredMessage(field);

  switch (field.kind) {
    case "text":
      return z.string({ error: required }).trim().min(1, required).max(200);
    case "textarea":
      return z.string({ error: required }).trim().min(1, required).max(2000);
    case "email":
      return z.string({ error: required }).trim().pipe(
        z.email("Enter an email address, like name@example.com."),
      );
    case "tel":
      return z
        .string({ error: required })
        .transform((value) => normalizePhone(value) ?? "")
        .refine(Boolean, `Enter a phone number, like ${phoneExample}.`);
    case "number":
      return z
        .string({ error: required })
        .trim()
        .regex(/^\d{1,4}$/, "Enter a whole number.")
        .transform(Number);
    case "date":
      return z
        .string({ error: required })
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a full date.")
        .refine(
          (value) => !field.past || value < todayIso(),
          "This date must be in the past.",
        );
    case "month":
      return z
        .string({ error: required })
        .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Enter a month and year.");
    case "select":
    case "radio":
      // Options built from today's date cannot be a fixed list.
      if (field.optionPattern) {
        return z.string({ error: required }).regex(field.optionPattern, required);
      }
      return z.enum(field.options as [string, ...string[]], { error: required });
    case "checkboxes":
      return z.array(z.enum(field.options as [string, ...string[]]));
    case "tick":
      return z.boolean({ error: required });
  }
}

function fieldSchema(field: InputField): z.ZodType {
  const filled = filledSchema(field);

  if (field.kind === "tick") {
    return field.required
      ? filled.refine((value) => value === true, {
          error: defaultRequiredMessage(field),
        })
      : filled.optional();
  }

  if (field.kind === "checkboxes") {
    const list = z.preprocess((value) => value ?? [], filled);
    return field.required
      ? list.refine((value) => (value as string[]).length > 0, {
          error: defaultRequiredMessage(field),
        })
      : list;
  }

  return field.required
    ? z.preprocess(emptyToUndefined, filled)
    : z.preprocess(emptyToUndefined, filled.optional());
}

function stepSchema(fields: InputField[]) {
  return z.object(
    Object.fromEntries(fields.map((field) => [field.key, fieldSchema(field)])),
  );
}

export function defineStep(
  step: Omit<Step, "schema" | "laterSchema"> & { fields: Field[] },
): Step {
  const fields = step.fields.filter(isInputField);

  return {
    ...step,
    schema: stepSchema(fields),
    laterSchema: stepSchema(
      fields.map((field) => ({ ...field, required: false })),
    ),
  };
}
