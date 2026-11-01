import { z } from "zod";
import { normalizeGhanaPhone } from "./phone";

// Scholarship Hunt alerts sign-up in the footer. Bump when fields change.
export const alertsFormVersion = 1;

export const alertsSchema = z.object({
  whatsapp: z
    .string()
    .transform((value) => normalizeGhanaPhone(value) ?? "")
    .refine(Boolean, "Enter a WhatsApp number, like 024 000 0000."),
  consent: z.boolean().refine((value) => value, {
    message: "Tick the box so we can send you alerts.",
  }),
});

export type AlertsInput = z.input<typeof alertsSchema>;
export type AlertsValues = z.output<typeof alertsSchema>;
