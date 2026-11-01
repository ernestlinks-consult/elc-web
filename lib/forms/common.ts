import { defineStep } from "./build";
import type { Field, Step } from "./types";

// Step 1 is the same shape everywhere: name, WhatsApp, two service choices,
// best time, consent. A lead is created when it saves (F-02). Choices are radios
// because a Radix Select does nothing without JavaScript.

export const startIntro = "Just the basics. We can reach you once you tap Save.";

export const heardFromKey = "heard_from";

const heardFromOptions = [
  "TikTok LIVE",
  "TikTok video",
  "Instagram",
  "Facebook",
  "A friend",
  "Google",
  "Other",
];

export const heardFrom: Field = {
  kind: "select",
  key: heardFromKey,
  label: "How did you hear about us?",
  options: heardFromOptions,
};

export const heardFromWithDrive: Field = {
  ...heardFrom,
  options: [
    ...heardFromOptions.slice(0, 5),
    "Passport drive",
    ...heardFromOptions.slice(5),
  ],
} as Field;

const startFields = (choices: Field[]): Field[] => [
  { kind: "text", key: "full_name", label: "Full name", required: true },
  {
    kind: "tel",
    key: "whatsapp",
    label: "WhatsApp number",
    required: true,
    placeholder: "024 000 0000",
    requiredMessage: "Enter a WhatsApp number, like 024 000 0000.",
  },
  ...choices,
  {
    kind: "radio",
    key: "best_time",
    label: "Best time to reach you",
    required: true,
    options: ["Morning", "Afternoon", "Evening", "Any time"],
  },
  {
    kind: "tick",
    key: "consent",
    label:
      "I agree that ErnestLinks Consult may contact me on WhatsApp or by phone about this request and keep my details for my application.",
    required: true,
    requiredMessage: "Tick the box so we can contact you.",
    privacyLink: true,
    full: true,
  },
];

export function startStep(choices: Field[]): Step {
  return defineStep({
    key: "start",
    title: "Start",
    intro: startIntro,
    fields: startFields(choices),
  });
}

export const reviewStep = defineStep({
  key: "review",
  title: "Review & confirm",
  intro: "Check your answers, then send. You can go back to any step.",
  fields: [
    {
      kind: "note",
      label:
        "After you send, we will check everything and message you. Nothing is submitted to any government office until you confirm.",
    },
    {
      kind: "tick",
      key: "confirm",
      label:
        "I confirm that the information I have given is true and correct to the best of my knowledge.",
      required: true,
      requiredMessage: "Tick the box to confirm your answers.",
      full: true,
    },
  ],
});
