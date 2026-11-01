import { defineStep } from "./build";
import { reviewStep, startStep } from "./common";
import type { ServiceForm } from "./types";

export const travelForm: ServiceForm = {
  service: "travel",
  name: "Travel",
  version: 1,
  timeHint: "About 2 minutes in total",
  later: [
    "Passport details of each traveller",
    "Payment, at the office or official MoMo",
  ],
  nextSteps: [
    "We send you options and prices on WhatsApp.",
    "You choose and confirm.",
    "We book and send your tickets or vouchers.",
  ],
  steps: [
    startStep([
      {
        kind: "checkboxes",
        key: "needs",
        label: "I need",
        required: true,
        options: ["Flight", "Hotel", "Tour package", "Conference trip", "Tourist visa"],
        full: true,
      },
    ]),
    defineStep({
      key: "trip",
      title: "Trip details",
      fields: [
        { kind: "text", key: "flying_from", label: "Flying from", placeholder: "e.g. Kumasi or Accra" },
        { kind: "text", key: "destination", label: "Destination" },
        { kind: "date", key: "departure_date", label: "Departure date" },
        { kind: "date", key: "return_date", label: "Return date", optional: true },
        { kind: "radio", key: "flexible_dates", label: "Flexible dates?", options: ["Yes", "No"] },
        {
          kind: "select",
          key: "cabin",
          label: "Cabin",
          options: ["Economy", "Premium economy", "Business"],
        },
        { kind: "number", key: "adults", label: "Adults" },
        { kind: "number", key: "children", label: "Children (2–11)", optional: true },
        { kind: "number", key: "infants", label: "Infants (under 2)", optional: true },
        {
          kind: "select",
          key: "budget",
          label: "Budget per person",
          options: [
            "Under GH¢5,000",
            "GH¢5,000–15,000",
            "GH¢15,000–30,000",
            "Over GH¢30,000",
          ],
        },
        { kind: "textarea", key: "requests", label: "Hotel area or special requests", optional: true },
      ],
    }),
    reviewStep,
  ],
};
