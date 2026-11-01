/**
 * Quotes a value for CSV. A cell starting with = + - or @ is prefixed with an
 * apostrophe: names and answers come from the public, and a spreadsheet would run
 * them as formulas.
 */
export function csvCell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;

  return /[",\r\n]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe;
}

export function csvRow(values: unknown[]) {
  return `${values.map(csvCell).join(",")}\r\n`;
}
