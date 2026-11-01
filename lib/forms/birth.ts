import { defineStep } from "./build";
import { reviewStep, startStep } from "./common";
import type { ServiceForm } from "./types";

export const birthForm: ServiceForm = {
  service: "birth",
  name: "Birth certificate",
  version: 2,
  timeHint: "About 4 minutes in total",
  later: [
    "Informant’s Voter ID or Ghana Card number",
    "Any existing birth record or weighing card",
    "Payment, at the office or official MoMo",
  ],
  nextSteps: [
    "We check the details against the registry’s requirements.",
    "We collect the informant’s ID number and payment.",
    "We submit and keep you updated until collection.",
  ],
  steps: [
    startStep([
      {
        kind: "radio",
        key: "certificate_for",
        label: "The certificate is for",
        required: true,
        options: ["Me", "My child", "Someone else"],
      },
      {
        kind: "radio",
        key: "application_type",
        label: "This is a",
        required: true,
        options: ["New certificate", "Correction", "Replacement"],
      },
    ]),
    defineStep({
      key: "person",
      title: "The person",
      intro: "Details of the person the certificate is for.",
      fields: [
        { kind: "text", key: "first_name", label: "First name" },
        { kind: "text", key: "middle_name", label: "Middle name", optional: true },
        { kind: "text", key: "surname", label: "Surname" },
        { kind: "date", key: "date_of_birth", label: "Date of birth", past: true },
        { kind: "radio", key: "gender", label: "Gender", options: ["Male", "Female"] },
        { kind: "tel", key: "contact_number", label: "Contact number" },
      ],
    }),
    defineStep({
      key: "father",
      title: "Father",
      fields: [
        { kind: "text", key: "father_first_name", label: "First name" },
        { kind: "text", key: "father_middle_name", label: "Middle name", optional: true },
        { kind: "text", key: "father_surname", label: "Surname" },
        { kind: "text", key: "father_occupation", label: "Occupation" },
        {
          kind: "text",
          key: "father_religion",
          label: "Religion",
          hint: "Asked for by the Births and Deaths Registry.",
        },
      ],
    }),
    defineStep({
      key: "mother",
      title: "Mother",
      intro: "Use her maiden name.",
      fields: [
        { kind: "text", key: "mother_first_name", label: "First name" },
        { kind: "text", key: "mother_middle_name", label: "Middle name", optional: true },
        { kind: "text", key: "mother_surname", label: "Surname (maiden name)" },
      ],
    }),
    defineStep({
      key: "informant",
      title: "Informant",
      intro: "The father or mother, if alive, who gives the information.",
      fields: [
        { kind: "text", key: "informant_first_name", label: "First name" },
        { kind: "text", key: "informant_middle_name", label: "Middle name", optional: true },
        { kind: "text", key: "informant_surname", label: "Surname" },
        { kind: "tel", key: "informant_telephone", label: "Telephone" },
        {
          kind: "select",
          key: "informant_relation",
          label: "Relation to the person",
          options: ["Father", "Mother", "Other"],
        },
        {
          kind: "note",
          label:
            "We’ll collect the informant’s Voter ID or Ghana Card number when we contact you, not on this website.",
        },
      ],
    }),
    reviewStep,
  ],
};
