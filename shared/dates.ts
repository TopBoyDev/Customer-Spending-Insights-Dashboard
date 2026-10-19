/**
 * Calendar-date helpers. All "dates" are YYYY-MM-DD strings representing a
 * calendar day in the Africa/Johannesburg timezone. Arithmetic is done on UTC
 * midnights so it is immune to the host machine's timezone and DST.
 */

export const APP_TIMEZONE = 'Africa/Johannesburg';

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 86_400_000;

/** True only for real calendar dates in strict YYYY-MM-DD form (rejects 2024-02-30). */
export function isValidIsoDate(value: string): boolean {
  const match = ISO_DATE.exec(value);
  if (!match) return false;
  const [, y, m, d] = match.map(Number) as [number, number, number, number];
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

function toUtcMs(isoDate: string): number {
  const [y, m, d] = isoDate.split('-').map(Number) as [number, number, number];
  return Date.UTC(y, m - 1, d);
}

function fromUtcMs(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(isoDate: string, days: number): string {
  return fromUtcMs(toUtcMs(isoDate) + days * MS_PER_DAY);
}

/** Whole days from `from` to `to` (positive when `to` is later). */
export function diffInDays(from: string, to: string): number {
  return Math.round((toUtcMs(to) - toUtcMs(from)) / MS_PER_DAY);
}

/** YYYY-MM for a YYYY-MM-DD date. */
export function toMonthKey(isoDate: string): string {
  return isoDate.slice(0, 7);
}

/** Adds calendar months to a YYYY-MM key. */
export function addMonths(monthKey: string, months: number): string {
  const [y, m] = monthKey.split('-').map(Number) as [number, number];
  const date = new Date(Date.UTC(y, m - 1 + months, 1));
  return date.toISOString().slice(0, 7);
}

export function daysInMonth(monthKey: string): number {
  const [y, m] = monthKey.split('-').map(Number) as [number, number];
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

const localDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: APP_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Converts an ISO instant (e.g. 2024-09-15T22:30:00Z) to its Johannesburg calendar date. */
export function toLocalDate(isoInstant: string): string {
  // en-CA formats as YYYY-MM-DD.
  return localDateFormatter.format(new Date(isoInstant));
}
