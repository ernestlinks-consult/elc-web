import { z } from "zod";

// Scholarship Hunt alerts sign-up in the footer. Bump when fields change.
export const alertsFormVersion = 1;

/** Accepts 0XX XXX XXXX or +233, with or without spaces and dashes. */
function isGhanaPhone(value: string) {
  return /^(0\d{9}|\+?233\d{9})$/.test(value.replace(/[\s-]/g, ""));
}

export const alertsSchema = z.object({
  whatsapp: z.string().trim().refine(isGhanaPhone, {
    message: "Enter a WhatsApp number, like 024 000 0000.",
  }),
  consent: z.boolean().refine((value) => value, {
    message: "Tick the box so we can send you alerts.",
  }),
});

export type AlertsValues = z.infer<typeof alertsSchema>;
