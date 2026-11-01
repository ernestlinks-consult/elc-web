import { defineStep } from "./build";
import { reviewStep, startStep } from "./common";
import type { Field, ServiceForm } from "./types";

const parent = (prefix: string, heading: string): Field[] => [
  { kind: "heading", label: heading },
  { kind: "text", key: `${prefix}_surname`, label: "Surname" },
  { kind: "text", key: `${prefix}_first_name`, label: "First name" },
  { kind: "radio", key: `${prefix}_living`, label: "Living", options: ["Yes", "No"] },
  { kind: "tel", key: `${prefix}_telephone`, label: "Telephone" },
  { kind: "email", key: `${prefix}_email`, label: "Email", optional: true },
  { kind: "text", key: `${prefix}_hometown`, label: "Hometown" },
  { kind: "text", key: `${prefix}_nationality`, label: "Nationality" },
  { kind: "text", key: `${prefix}_residential_address`, label: "Residential address", full: true },
  { kind: "text", key: `${prefix}_postal_address`, label: "Postal address", optional: true, full: true },
];

const guarantor = (number: number): Field[] => [
  { kind: "heading", label: `Guarantor ${number} (not a parent)` },
  { kind: "text", key: `guarantor_${number}_full_name`, label: "Full name" },
  { kind: "text", key: `guarantor_${number}_occupation`, label: "Occupation" },
  { kind: "tel", key: `guarantor_${number}_telephone`, label: "Telephone" },
  { kind: "email", key: `guarantor_${number}_email`, label: "Email", optional: true },
  { kind: "text", key: `guarantor_${number}_residential_address`, label: "Residential address", full: true },
  { kind: "text", key: `guarantor_${number}_postal_address`, label: "Postal address", optional: true, full: true },
];

export const passportForm: ServiceForm = {
  service: "passport",
  name: "Passport",
  version: 1,
  timeHint: "About 8 minutes in total",
  later: [
    "Ghana Card number (and SSNIT number, optional)",
    "Biometric birth certificate",
    "Passport picture",
    "Payment, at the office or official MoMo",
  ],
  nextSteps: [
    "We confirm your package and check your details.",
    "We collect your Ghana Card number, documents and payment.",
    "We register you and book vetting and biometrics.",
  ],
  steps: [
    startStep([
      {
        kind: "radio",
        key: "package",
        label: "Package",
        required: true,
        options: ["Standard", "Express"],
        optionPrices: {
          Standard: "passport_standard",
          Express: "passport_express",
        },
      },
      {
        kind: "radio",
        key: "application_type",
        label: "This is a",
        required: true,
        options: ["New passport", "Renewal", "Replacement (lost or damaged)"],
      },
    ]),
    defineStep({
      key: "about_you",
      title: "About you",
      intro: "As it should appear on your passport.",
      fields: [
        { kind: "radio", key: "title", label: "Title", options: ["Mr", "Mrs", "Miss", "Dr"] },
        { kind: "radio", key: "gender", label: "Gender", options: ["Male", "Female"] },
        { kind: "text", key: "surname", label: "Surname" },
        { kind: "text", key: "first_name", label: "First name" },
        { kind: "text", key: "other_names", label: "Other name(s)", optional: true },
        { kind: "text", key: "maiden_name", label: "Maiden name", optional: true },
        { kind: "text", key: "previous_names", label: "Previous names", optional: true },
        { kind: "date", key: "date_of_birth", label: "Date of birth", past: true },
        { kind: "text", key: "birth_city", label: "City or town of birth" },
        { kind: "text", key: "birth_country", label: "Country of birth", placeholder: "Ghana" },
        {
          kind: "select",
          key: "marital_status",
          label: "Marital status",
          options: ["Single", "Married", "Divorced", "Widowed"],
        },
        { kind: "text", key: "profession", label: "Profession" },
        { kind: "text", key: "height", label: "Height", placeholder: "e.g. 1.72 m" },
        { kind: "text", key: "eye_colour", label: "Eye colour" },
        { kind: "text", key: "hair_colour", label: "Hair colour" },
        {
          kind: "text",
          key: "visible_peculiarities",
          label: "Visible peculiarities",
          optional: true,
          placeholder: "e.g. scar on left cheek",
        },
        { kind: "radio", key: "dual_citizenship", label: "Dual citizenship", options: ["No", "Yes"] },
      ],
    }),
    defineStep({
      key: "contact_address",
      title: "Contact & address",
      intro: "Where you live and where your passport should be delivered.",
      fields: [
        { kind: "tel", key: "secondary_phone", label: "Secondary phone", optional: true },
        { kind: "email", key: "email", label: "Email" },
        { kind: "text", key: "house_number", label: "House number" },
        { kind: "text", key: "street_name", label: "Street name" },
        {
          kind: "text",
          key: "digital_address",
          label: "Digital address (GhanaPost GPS)",
          placeholder: "AK-000-0000",
        },
        { kind: "text", key: "postal_address", label: "Postal address", optional: true },
        { kind: "text", key: "suburb", label: "Suburb" },
        { kind: "text", key: "city", label: "City of residence" },
        { kind: "text", key: "country", label: "Country of residence", placeholder: "Ghana" },
        { kind: "text", key: "postal_code", label: "Postal or ZIP code", optional: true },
        {
          kind: "textarea",
          key: "delivery_address",
          label: "Delivery address",
          placeholder: "If different from your home address",
        },
      ],
    }),
    defineStep({
      key: "education",
      title: "Education",
      intro: "Your most recent school.",
      fields: [
        { kind: "text", key: "institution", label: "Institution name", full: true },
        { kind: "month", key: "start_month", label: "Start date" },
        { kind: "month", key: "completion_month", label: "Completion date" },
        { kind: "text", key: "school_postal_address", label: "School’s postal address", full: true },
      ],
    }),
    defineStep({
      key: "family",
      title: "Family",
      intro: "Your parents and one grandparent, as the Passport Office requires.",
      fields: [
        ...parent("father", "Father"),
        ...parent("mother", "Mother (maiden name)"),
        ...parent("grandparent", "Grandparent"),
      ],
    }),
    defineStep({
      key: "guarantors",
      title: "Guarantors",
      intro:
        "Two people who know you and are not your parents. Please ask them first.",
      fields: [...guarantor(1), ...guarantor(2)],
    }),
    reviewStep,
  ],
};
