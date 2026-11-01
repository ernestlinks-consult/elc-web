const marker = "[PLACEHOLDER";

/**
 * True for a value still waiting on ELC, at any depth of a settings object. Used
 * so a placeholder can never reach a visitor; scripts/check-placeholders.mjs
 * applies the same marker at build time.
 */
export function isPlaceholder(value: unknown): boolean {
  if (typeof value === "string") return value.includes(marker);
  if (Array.isArray(value)) return value.some(isPlaceholder);
  if (value && typeof value === "object") {
    return Object.values(value).some(isPlaceholder);
  }
  return false;
}

/** The value, or null if it is still a placeholder. */
export function publicValue<T>(value: T): T | null {
  return isPlaceholder(value) ? null : value;
}
