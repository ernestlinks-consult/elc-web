import { isServiceKey, serviceForms } from "@/lib/forms";
import { isInputField } from "@/lib/forms/types";

// Turns stored step answers into what staff read. Form definitions supply the
// labels; an answer from an older form version falls back to its key.

type StoredStep = {
  step_index: number;
  step_key: string;
  version: number;
  answers: unknown;
};

export type AnswerRow = { label: string; value: string };
export type AnswerGroup = { title: string; rows: AnswerRow[] };

const hiddenKeys = new Set(["consent", "confirm"]);

const sentenceCase = (key: string) => {
  const words = key.replaceAll("_", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
};

function displayValue(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function groupFor(service: string, step: StoredStep): AnswerGroup {
  const definition = isServiceKey(service)
    ? serviceForms[service].steps[step.step_index]
    : undefined;
  const labels = new Map(
    definition?.fields
      .filter(isInputField)
      .map((field) => [field.key, field.label]),
  );

  return {
    title: definition?.title ?? sentenceCase(step.step_key),
    rows: Object.entries((step.answers ?? {}) as Record<string, unknown>)
      .filter(
        ([key, value]) =>
          !hiddenKeys.has(key) &&
          value !== null &&
          value !== "" &&
          !(Array.isArray(value) && value.length === 0),
      )
      .map(([key, value]) => ({
        label: labels.get(key) ?? sentenceCase(key),
        value: displayValue(value),
      })),
  };
}

/** Latest answers per step, and every older version kept for the history toggle. */
export function splitVersions(service: string, steps: StoredStep[]) {
  const ordered = [...steps].sort(
    (a, b) => a.step_index - b.step_index || b.version - a.version,
  );
  const seen = new Set<number>();
  const latest: StoredStep[] = [];
  const earlier: StoredStep[] = [];

  for (const step of ordered) {
    if (seen.has(step.step_index)) {
      earlier.push(step);
    } else {
      seen.add(step.step_index);
      latest.push(step);
    }
  }

  return {
    latest: latest.map((step) => groupFor(service, step)),
    earlier: earlier
      .sort((a, b) => b.version - a.version)
      .map((step) => ({
        version: step.version,
        ...groupFor(service, step),
      })),
  };
}
