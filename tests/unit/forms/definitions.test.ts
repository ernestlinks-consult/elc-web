import { describe, expect, test } from "vitest";
import { serviceForms, serviceKeys } from "@/lib/forms";
import { isInputField, type Step } from "@/lib/forms/types";

const forms = Object.values(serviceForms);

const stepCounts = {
  passport: 7,
  birth: 6,
  school: 5,
  visa: 4,
  work: 3,
  exams: 3,
  travel: 3,
};

/** The fewest answers that satisfy a step. */
function validValues(step: Step) {
  const values: Record<string, unknown> = {};

  for (const field of step.fields.filter(isInputField)) {
    if (!field.required) continue;
    if (field.kind === "tick") values[field.key] = true;
    else if (field.kind === "tel") values[field.key] = "024 000 0000";
    else if (field.kind === "checkboxes") values[field.key] = [field.options[0]];
    else if (field.kind === "radio" || field.kind === "select") {
      values[field.key] = field.options[0];
    } else values[field.key] = "Ama Mensah";
  }

  return values;
}

const issuesFor = (step: Step, values: Record<string, unknown>) => {
  const result = step.schema.safeParse(values);
  return result.success ? [] : result.error.issues.map((issue) => issue.path[0]);
};

test("covers all seven services", () => {
  expect(forms.map((form) => form.service)).toEqual([...serviceKeys]);
});

test.each(Object.entries(stepCounts))("%s has %i steps", (service, count) => {
  expect(serviceForms[service as keyof typeof serviceForms].steps).toHaveLength(
    count,
  );
});

test("every form has a version, later list and next steps", () => {
  for (const form of forms) {
    expect(form.version).toBeGreaterThan(0);
    expect(form.later.length).toBeGreaterThan(0);
    expect(form.nextSteps).toHaveLength(3);
  }
});

test("field keys are unique within each step", () => {
  for (const form of forms) {
    for (const step of form.steps) {
      const keys = step.fields.filter(isInputField).map((field) => field.key);
      expect(new Set(keys).size).toBe(keys.length);
    }
  }
});

test("prices are never hard-coded: labels read them from the database", () => {
  for (const form of forms) {
    expect(JSON.stringify(form.steps.map((step) => step.fields))).not.toMatch(
      /GH¢(600|1,800)/,
    );
  }
});

describe("banned fields (F-06)", () => {
  const banned = [
    "ghana card",
    "ssnit",
    "voter",
    "id number",
    "id_number",
    "passport number",
    "passport_number",
    "upload",
    "payment",
    "momo",
    "card",
    "facilitator",
  ];

  test.each(forms.map((form) => [form.service, form] as const))(
    "%s collects none",
    (_service, form) => {
      for (const step of form.steps) {
        // Notes may tell people what is collected later; fields may not ask.
        for (const field of step.fields.filter(isInputField)) {
          const text = JSON.stringify(field).toLowerCase();
          for (const word of banned) expect(text).not.toContain(word);
        }
      }
    },
  );

  test("the scan really finds a banned field", () => {
    const text = JSON.stringify({ key: "ghana_card", label: "Ghana Card" });
    expect(text.toLowerCase()).toContain("card");
  });

  test("no field is a file input", () => {
    for (const form of forms) {
      for (const step of form.steps) {
        for (const field of step.fields) {
          expect(field.kind).not.toBe("file");
        }
      }
    }
  });
});

describe.each(forms.map((form) => [form.service, form] as const))(
  "%s schemas",
  (_service, form) => {
    const [first, ...rest] = form.steps;

    test("step 1 has the shared fields, in order", () => {
      const keys = first.fields.filter(isInputField).map((field) => field.key);

      expect(keys.slice(0, 2)).toEqual(["full_name", "whatsapp"]);
      expect(keys.slice(-2)).toEqual(["best_time", "consent"]);
    });

    test("step 1 accepts valid answers and normalises the phone", () => {
      const parsed = first.schema.parse(validValues(first)) as {
        whatsapp: string;
      };

      expect(parsed.whatsapp).toBe("+233240000000");
    });

    test("step 1 names every empty required field", () => {
      const required = first.fields
        .filter(isInputField)
        .filter((field) => field.required)
        .map((field) => field.key);

      expect(issuesFor(first, {}).sort()).toEqual([...required].sort());
    });

    test("step 1 rejects an option that is not offered", () => {
      const radio = first.fields
        .filter(isInputField)
        .find((field) => field.kind === "radio" && field.required)!;
      const values = { ...validValues(first), [radio.key]: "Hacked" };

      expect(issuesFor(first, values)).toEqual([radio.key]);
    });

    test("step 1 needs consent", () => {
      expect(
        issuesFor(first, { ...validValues(first), consent: false }),
      ).toEqual(["consent"]);
    });

    test("later steps accept minimal answers", () => {
      for (const step of rest) {
        expect(issuesFor(step, validValues(step))).toEqual([]);
      }
    });

    test("later steps drop keys the step does not define", () => {
      for (const step of rest) {
        const parsed = step.schema.parse({
          ...validValues(step),
          ghana_card: "GHA-000000000-0",
        }) as Record<string, unknown>;

        expect(parsed).not.toHaveProperty("ghana_card");
      }
    });

    test("formats are checked on every field", () => {
      for (const step of form.steps) {
        for (const field of step.fields.filter(isInputField)) {
          const base = validValues(step);
          if (field.kind === "tel") {
            expect(issuesFor(step, { ...base, [field.key]: "12345" })).toEqual([
              field.key,
            ]);
          }
          if (field.kind === "email") {
            expect(issuesFor(step, { ...base, [field.key]: "nope" })).toEqual([
              field.key,
            ]);
          }
          if (field.kind === "number") {
            expect(issuesFor(step, { ...base, [field.key]: "two" })).toEqual([
              field.key,
            ]);
          }
          if (field.kind === "month") {
            expect(
              issuesFor(step, { ...base, [field.key]: "2026-13" }),
            ).toEqual([field.key]);
          }
        }
      }
    });
  },
);

describe("birth dates", () => {
  const steps = [serviceForms.passport.steps[1], serviceForms.birth.steps[1]];
  const offset = (days: number) =>
    new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

  test.each(steps.map((step) => [step.key, step] as const))(
    "%s must be in the past",
    (_key, step) => {
      expect(issuesFor(step, { date_of_birth: offset(-1) })).toEqual([]);
      expect(issuesFor(step, { date_of_birth: offset(0) })).toEqual([
        "date_of_birth",
      ]);
      expect(issuesFor(step, { date_of_birth: offset(1) })).toEqual([
        "date_of_birth",
      ]);
    },
  );
});

test("blank optional answers are accepted, not stored as empty strings", () => {
  const step = serviceForms.passport.steps[2];
  const parsed = step.schema.parse({ email: "", secondary_phone: "" });

  expect(parsed).toEqual({ email: undefined, secondary_phone: undefined });
});
