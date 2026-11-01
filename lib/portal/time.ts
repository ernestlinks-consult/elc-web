const zone = "Africa/Accra";

export function exactTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: zone,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function relativeTime(value: string, now: Date) {
  const minutes = Math.round((now.getTime() - new Date(value).getTime()) / 60_000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;

  const days = Math.floor(hours / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

/** Midnight today in Accra, for "today" counts. */
export function startOfToday(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  return `${parts}T00:00:00+00:00`;
}

export function greeting(now: Date) {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: zone,
      hour: "numeric",
      hour12: false,
    }).format(now),
  );

  if (hour < 12) return "Good morning";
  return hour < 17 ? "Good afternoon" : "Good evening";
}
