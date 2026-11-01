import { defineStep } from "./build";
import { heardFrom, reviewStep, startStep } from "./common";
import type { ServiceForm } from "./types";

export const workForm: ServiceForm = {
  service: "work",
  name: "Work abroad",
  version: 1,
  timeHint: "About 3 minutes in total",
  later: [
    "Professional licence and certificates",
    "Passport bio page",
    "CV and references",
  ],
  nextSteps: [
    "We review your profile against openings we have verified.",
    "We tell you honestly which routes fit, and the costs in writing.",
    "We prepare your application and, later, your visa.",
  ],
  steps: [
    startStep([
      {
        kind: "radio",
        key: "interest",
        label: "I’m interested in",
        required: true,
        options: ["A bridging programme", "A job opening", "Not sure yet"],
      },
      {
        kind: "radio",
        key: "field",
        label: "Field",
        options: ["Nursing", "Care work", "Hospitality", "Construction or trades", "Logistics", "Other"],
        full: true,
      },
    ]),
    defineStep({
      key: "experience",
      title: "Your experience",
      intro: "Helps us match you only with routes you qualify for.",
      fields: [
        { kind: "text", key: "profession", label: "Profession or job title", full: true },
        { kind: "number", key: "experience_years", label: "Years of experience" },
        {
          kind: "select",
          key: "highest_qualification",
          label: "Highest qualification",
          options: ["WASSCE", "Certificate", "Diploma or HND", "Bachelor’s", "Master’s"],
        },
        {
          kind: "radio",
          key: "professional_licence",
          label: "Professional licence (for example nursing PIN)",
          options: ["Yes", "No", "Not applicable"],
          full: true,
        },
        {
          kind: "checkboxes",
          key: "countries",
          label: "Countries you’re open to",
          options: ["UAE", "Malta", "UK", "Canada", "Germany", "Open to advice"],
          full: true,
        },
        {
          kind: "select",
          key: "passport_status",
          label: "Your passport",
          options: ["Valid", "Expired", "No passport yet"],
        },
        {
          kind: "select",
          key: "english_test",
          label: "English test",
          options: ["IELTS", "OET", "Other", "Not taken yet"],
        },
        {
          kind: "radio",
          key: "asked_to_pay",
          label: "Has anyone asked you to pay for a job offer?",
          options: ["No", "Yes, I’d like you to check it"],
          full: true,
        },
        heardFrom,
      ],
    }),
    reviewStep,
  ],
};
