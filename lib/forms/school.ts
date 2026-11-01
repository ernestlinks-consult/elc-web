import { defineStep } from "./build";
import { heardFromWithDrive, reviewStep, startStep } from "./common";
import type { ServiceForm } from "./types";

export const schoolForm: ServiceForm = {
  service: "school",
  name: "School applications",
  version: 1,
  timeHint: "About 5 minutes in total",
  later: [
    "Transcripts and certificates",
    "Passport bio page",
    "CV, references and statement of purpose",
    "English test results",
  ],
  nextSteps: [
    "We review your profile and shortlist programmes.",
    "We agree the plan and our service fee in writing.",
    "We start your documents kit and applications.",
  ],
  steps: [
    startStep([
      {
        kind: "radio",
        key: "level",
        label: "Level",
        required: true,
        options: [
          "Diploma or certificate",
          "Bachelor’s",
          "Master’s",
          "PhD",
          "Bridging programme",
          "Not sure",
        ],
        full: true,
      },
      {
        kind: "radio",
        key: "start_intake",
        label: "When do you want to start?",
        options: ["Jan 2027", "May 2027", "Sep 2027", "Jan 2028", "Not sure"],
        full: true,
      },
    ]),
    defineStep({
      key: "goals",
      title: "Your goals",
      intro: "Helps us shortlist programmes that fit.",
      fields: [
        {
          kind: "checkboxes",
          key: "countries",
          label: "Countries you’re considering",
          options: ["UK", "Canada", "USA", "Germany", "Malta", "Ireland", "Open to advice"],
          full: true,
        },
        {
          kind: "text",
          key: "field_of_interest",
          label: "Course or field of interest",
          placeholder: "e.g. Public health, Nursing, MBA",
          full: true,
        },
        {
          kind: "text",
          key: "video_keyword",
          label: "Saw a programme in our videos?",
          optional: true,
          placeholder: "Keyword, e.g. MALTA CARE",
        },
        {
          kind: "select",
          key: "tuition_budget",
          label: "Yearly tuition you can afford",
          options: [
            "Under US$5,000",
            "US$5,000–10,000",
            "US$10,000–20,000",
            "Over US$20,000",
            "I need a full scholarship",
          ],
        },
        {
          kind: "checkboxes",
          key: "funding",
          label: "Who is paying?",
          options: ["Myself", "Family", "Sponsor or employer", "Scholarship needed", "Loan"],
          full: true,
        },
      ],
    }),
    defineStep({
      key: "education",
      title: "Education",
      intro: "Your highest qualification so far.",
      fields: [
        {
          kind: "select",
          key: "highest_qualification",
          label: "Highest qualification",
          options: ["WASSCE", "Diploma or HND", "Bachelor’s", "Master’s"],
        },
        { kind: "text", key: "institution", label: "Institution" },
        { kind: "text", key: "course_studied", label: "Course studied" },
        {
          kind: "select",
          key: "grade",
          label: "Class or grade",
          options: [
            "First class",
            "Second class upper",
            "Second class lower",
            "Third class",
            "Pass",
            "WASSCE (enter aggregate below)",
          ],
        },
        {
          kind: "text",
          key: "year_completed",
          label: "Year completed or expected",
          placeholder: "e.g. 2025",
        },
        {
          kind: "select",
          key: "national_service",
          label: "National Service",
          options: ["Completed", "Ongoing", "Not yet", "Not applicable"],
        },
        {
          kind: "number",
          key: "work_experience_years",
          label: "Years of work experience",
          optional: true,
        },
      ],
    }),
    defineStep({
      key: "tests_documents",
      title: "Tests & documents",
      intro: "Tell us what you already have. It’s fine if the answer is “not yet”.",
      fields: [
        {
          kind: "select",
          key: "english_test",
          label: "English test",
          options: ["IELTS", "TOEFL", "Other test", "Not taken yet", "Hoping for a waiver"],
        },
        { kind: "text", key: "test_score", label: "Score, if taken", optional: true },
        {
          kind: "select",
          key: "passport_status",
          label: "Passport",
          options: ["Valid", "Expired", "I don’t have one yet"],
        },
        {
          kind: "checkboxes",
          key: "documents_ready",
          label: "Documents ready",
          options: ["Transcript", "Certificate", "CV", "References", "Statement of purpose"],
          full: true,
        },
        heardFromWithDrive,
        { kind: "textarea", key: "notes", label: "Anything else we should know?", optional: true },
      ],
    }),
    reviewStep,
  ],
};
