import { parsePhoneNumberFromString } from "libphonenumber-js";

export const phoneExample = "024 000 0000 or +44 7911 123456";

/**
 * Accepts Ghana numbers (0XX XXX XXXX, +233…) and any international number in +
 * form. Returns E.164, or null. Ghana numbers are checked strictly. Foreign ones
 * only need a possible length: the library's data rejects real numbers in ranges
 * it does not know, and turning away a real lead costs more than one bad number.
 */
export function normalizePhone(value: string): string | null {
  const parsed = parsePhoneNumberFromString(value.trim(), "GH");
  if (!parsed) return null;

  const accepted =
    parsed.country === "GH" ? parsed.isValid() : parsed.isPossible();

  return accepted ? parsed.number : null;
}
