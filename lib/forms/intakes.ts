const intakeMonths = [
  { label: "Jan", index: 0 },
  { label: "May", index: 4 },
  { label: "Sep", index: 8 },
];

const count = 6;

export const notSure = "Not sure";

/** Matches every intake nextIntakes can produce, whatever the year. */
export const intakePattern = /^((Jan|May|Sep) \d{4}|Not sure)$/;

/**
 * The next six intakes after today in Africa/Accra. The current month is left out:
 * by the time an application is ready, an intake starting now has gone.
 */
export function nextIntakes(now: Date): string[] {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Accra",
    year: "numeric",
    month: "numeric",
  }).formatToParts(now);
  const part = (type: string) =>
    Number(parts.find((item) => item.type === type)?.value);

  const currentMonth = part("month") - 1;
  const intakes: string[] = [];

  for (let year = part("year"); intakes.length < count; year += 1) {
    for (const { label, index } of intakeMonths) {
      const upcoming = year > part("year") || index > currentMonth;
      if (upcoming && intakes.length < count) {
        intakes.push(`${label} ${year}`);
      }
    }
  }

  return intakes;
}
