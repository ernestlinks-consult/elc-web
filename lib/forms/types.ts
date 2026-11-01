import type { z } from "zod";

export const serviceKeys = [
  "passport",
  "birth",
  "school",
  "visa",
  "work",
  "exams",
  "travel",
] as const;

export type ServiceKey = (typeof serviceKeys)[number];

type FieldBase = {
  key: string;
  label: string;
  required?: boolean;
  /** Shows "(optional)" after the label. */
  optional?: boolean;
  hint?: string;
  /** Spans the full width of the form grid. */
  full?: boolean;
  /** Replaces the default message when a required field is empty. */
  requiredMessage?: string;
};

export type Field =
  | (FieldBase & {
      kind: "text" | "tel" | "email" | "number";
      placeholder?: string;
    })
  | (FieldBase & {
      kind: "date";
      placeholder?: string;
      /** Must be before today, as for a date of birth (F-07). */
      past?: boolean;
    })
  | (FieldBase & { kind: "month" })
  | (FieldBase & {
      kind: "select" | "radio" | "checkboxes";
      options: string[];
      /** Option to prices.key, so the label can show the current price. */
      optionPrices?: Record<string, string>;
    })
  | (FieldBase & { kind: "textarea"; placeholder?: string })
  | (FieldBase & { kind: "tick"; privacyLink?: boolean })
  | { kind: "heading" | "note"; label: string };

export type InputField = Exclude<Field, { kind: "heading" | "note" }>;

export type Step = {
  key: string;
  title: string;
  intro?: string;
  fields: Field[];
  schema: z.ZodType;
};

export type ServiceForm = {
  service: ServiceKey;
  name: string;
  version: number;
  timeHint: string;
  steps: Step[];
  later: string[];
  nextSteps: string[];
};

export function isInputField(field: Field): field is InputField {
  return field.kind !== "heading" && field.kind !== "note";
}
