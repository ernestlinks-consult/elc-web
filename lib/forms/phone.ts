/**
 * Accepts 0XX XXX XXXX, 233XXXXXXXXX or +233XXXXXXXXX, with or without spaces
 * and dashes. Returns E.164 (+233…), or null if it is not a Ghana number.
 */
export function normalizeGhanaPhone(value: string): string | null {
  const compact = value.replace(/[\s-]/g, "");
  const match = compact.match(/^(?:0|\+?233)(\d{9})$/);

  return match ? `+233${match[1]}` : null;
}
