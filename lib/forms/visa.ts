import { defineStep } from "./build";
import { reviewStep, startStep } from "./common";
import type { ServiceForm } from "./types";

export const visaForm: ServiceForm = {
  service: "visa",
  name: "Visa",
  version: 2,
  timeHint: "About 4 minutes in total",
  later: [
    "Passport bio page",
    "Offer, CAS, I-20 or invitation letter",
    "Bank statements and sponsor letters",
  ],
  nextSteps: [
    "We check your case against the current rules.",
    "We agree our service fee in writing.",
    "We prepare your forms and book your appointment.",
  ],
  steps: [
    startStep([
      {
        kind: "radio",
        key: "visa_type",
        label: "Visa type",
        required: true,
        options: ["Student", "Work", "Visitor or tourist", "Conference", "Family visit"],
        full: true,
      },
      {
        kind: "radio",
        key: "destination",
        label: "Destination",
        options: ["UK", "Canada", "USA", "Germany", "Malta", "Ireland", "Schengen (other)", "Other"],
        full: true,
      },
    ]),
    defineStep({
      key: "trip",
      title: "Your trip",
      fields: [
        { kind: "month", key: "travel_month", label: "Planned travel date" },
        {
          kind: "select",
          key: "stay_length",
          label: "Length of stay",
          options: ["Under 1 month", "1–6 months", "6–12 months", "Over 1 year"],
        },
        {
          kind: "radio",
          key: "has_offer",
          label: "Do you have an offer, CAS, I-20, job offer or invitation?",
          options: ["Yes", "Not yet", "Not needed"],
          full: true,
        },
        {
          kind: "radio",
          key: "arranged_by_elc",
          label: "Was it arranged through ELC?",
          options: ["Yes", "No"],
          full: true,
        },
        { kind: "textarea", key: "trip_purpose", label: "Purpose of the trip", optional: true },
      ],
    }),
    defineStep({
      key: "background",
      title: "Background",
      intro: "Embassies look at these closely, so honest answers help us prepare you.",
      fields: [
        {
          kind: "select",
          key: "passport_status",
          label: "Your passport",
          options: ["Valid", "Expires within 6 months", "Expired", "No passport yet"],
        },
        {
          kind: "select",
          key: "current_status",
          label: "Current status",
          options: ["Student", "National Service", "Employed", "Self-employed", "Not working"],
        },
        { kind: "radio", key: "travelled_before", label: "Travelled abroad before?", options: ["No", "Yes"] },
        { kind: "text", key: "countries_visited", label: "Countries visited", optional: true },
        { kind: "radio", key: "visa_refused", label: "Ever been refused a visa?", options: ["No", "Yes"] },
        { kind: "text", key: "refusal_details", label: "If yes, which country and year", optional: true },
        {
          kind: "checkboxes",
          key: "funding",
          label: "Who is paying for the trip?",
          options: ["Myself", "Parent or family", "Sponsor", "Employer", "Scholarship"],
          full: true,
        },
      ],
    }),
    reviewStep,
  ],
};
