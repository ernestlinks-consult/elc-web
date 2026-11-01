import { defineStep } from "./build";
import { reviewStep, startStep } from "./common";
import type { ServiceForm } from "./types";

export const examsForm: ServiceForm = {
  service: "exams",
  name: "Exams",
  version: 2,
  timeHint: "About 2 minutes in total",
  later: ["Passport or Ghana Card details for registration", "Test fee payment"],
  nextSteps: [
    "We confirm test dates and centres.",
    "We agree registration and tuition fees.",
    "We register you and schedule your classes.",
  ],
  steps: [
    startStep([
      {
        kind: "radio",
        key: "exam",
        label: "Exam",
        required: true,
        options: ["IELTS Academic", "IELTS General", "TOEFL", "SAT", "GRE", "GMAT", "Not sure"],
        full: true,
      },
      {
        kind: "radio",
        key: "need",
        label: "I need",
        required: true,
        options: ["Registration", "Tuition", "Both"],
      },
    ]),
    defineStep({
      key: "plan",
      title: "Your plan",
      fields: [
        { kind: "month", key: "test_month", label: "Preferred test month" },
        {
          kind: "select",
          key: "reason",
          label: "Why are you taking it?",
          options: ["Study", "Work", "Migration", "Other"],
        },
        { kind: "text", key: "target_score", label: "Target score", optional: true },
        { kind: "text", key: "previous_score", label: "Previous score, if any", optional: true },
        {
          kind: "radio",
          key: "tuition_format",
          label: "Tuition format",
          options: ["At our office", "Online", "Either"],
        },
        {
          kind: "checkboxes",
          key: "class_times",
          label: "When can you attend classes?",
          options: ["Weekdays", "Evenings", "Weekends"],
          full: true,
        },
      ],
    }),
    reviewStep,
  ],
};
