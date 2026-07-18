// Date helpers. Kept tiny and dependency-free so they're trivial to test.
// All functions treat dates as calendar days in UTC to avoid timezone drift.

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Parse an ISO date (YYYY-MM-DD) to a UTC-midnight timestamp. */
function toUTC(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, (m ?? 1) - 1, d ?? 1);
}

/**
 * Whole calendar days from `from` until `to`.
 * Positive = in the future, 0 = today, negative = in the past.
 */
export function daysBetween(from: string, to: string): number {
  return Math.round((toUTC(to) - toUTC(from)) / MS_PER_DAY);
}

/** Days from `today` until `date` (negative if already past). */
export function daysUntil(date: string, today: string): number {
  return daysBetween(today, date);
}

/** Human phrase for a due date relative to today. */
export function relativeDue(date: string, today: string): string {
  const d = daysUntil(date, today);
  if (d < 0) return `${Math.abs(d)}d ago`;
  if (d === 0) return "today";
  if (d === 1) return "tomorrow";
  return `in ${d} days`;
}

/** "12 days ago" style phrase for a past date; "never" when null. */
export function relativeUsed(date: string | null, today: string): string {
  if (date === null) return "never";
  const d = daysUntil(date, today);
  if (d >= 0) return "today";
  const days = Math.abs(d);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}
