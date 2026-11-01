import { z } from "zod";
import { normalizeGhanaPhone } from "./phone";

// General contact form. Saves to messages. Bump when fields change.
export const contactFormVersion = 1;

export const contactTopics = [
  "General question",
  "Passport drive for my association",
  "Partnership",
  "Media or speaking",
  "Internship or NSS",
  "Feedback or complaint",
];

export const contactSchema = z.object({
  full_name: z.string().trim().min(1, "Enter your full name.").max(200),
  whatsapp: z
    .string()
    .transform((value) => normalizeGhanaPhone(value) ?? "")
    .refine(Boolean, "Enter a WhatsApp number, like 024 000 0000."),
  email: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.email("Enter an email address, like name@example.com.").optional(),
  ),
  topic: z.enum(contactTopics as [string, ...string[]], {
    error: "Choose a topic.",
  }),
  message: z.string().trim().min(1, "Enter your message.").max(2000),
  consent: z.boolean().refine((value) => value, {
    message: "Tick the box so we can reply to you.",
  }),
});

export type ContactInput = z.input<typeof contactSchema>;
