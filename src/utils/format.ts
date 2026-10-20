import { APP_TIMEZONE } from '../../shared/dates';
import { LOCALE } from '../i18n/locale';

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'ZAR',
});

const wholeCurrencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'ZAR',
  maximumFractionDigits: 0,
});

const oneDecimal = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 });
const integerFormatter = new Intl.NumberFormat(LOCALE);

/** R 4 250,75 */
export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

/** R 4 251, for chart labels where cents add noise. */
export function formatCurrencyWhole(amount: number): string {
  return wholeCurrencyFormatter.format(amount);
}

/** Short axis label: R0, R850, R4,3k */
export function formatCurrencyAxis(amount: number): string {
  if (Math.abs(amount) >= 1000) return `R${oneDecimal.format(amount / 1000)}k`;
  return `R${integerFormatter.format(Math.round(amount))}`;
}

export function formatNumber(value: number): string {
  return integerFormatter.format(value);
}

/** 29,4% */
export function formatPercent(value: number): string {
  return `${oneDecimal.format(value)}%`;
}

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: APP_TIMEZONE,
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const dayHeadingFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: APP_TIMEZONE,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: APP_TIMEZONE,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/** Calendar dates (YYYY-MM-DD) are anchored at midday UTC so any timezone renders the same day. */
function calendarDate(isoDate: string): Date {
  return new Date(`${isoDate}T12:00:00Z`);
}

/** "19 Oct 2026" for a YYYY-MM-DD calendar date. */
export function formatCalendarDate(isoDate: string): string {
  return dateFormatter.format(calendarDate(isoDate));
}

export function formatDateRange(startDate: string, endDate: string): string {
  return `${formatCalendarDate(startDate)} – ${formatCalendarDate(endDate)}`;
}

/** Transaction instant → Johannesburg date, e.g. "16 Sep 2024". */
export function formatTransactionDate(isoInstant: string): string {
  return dateFormatter.format(new Date(isoInstant));
}

const dayMonthFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: APP_TIMEZONE,
  day: 'numeric',
  month: 'short',
});

/**
 * Transaction instant → "17 Oct". Unambiguous within any selectable period
 * (the longest is one year), so the year is omitted where space is tight.
 */
export function formatTransactionDayMonth(isoInstant: string): string {
  return dayMonthFormatter.format(new Date(isoInstant));
}

/** Transaction instant → Johannesburg time, e.g. "14:30". */
export function formatTransactionTime(isoInstant: string): string {
  return timeFormatter.format(new Date(isoInstant));
}

/** "Wednesday, 16 September 2024" for a YYYY-MM-DD calendar date. */
export function formatDayHeading(isoDate: string): string {
  return dayHeadingFormatter.format(calendarDate(isoDate));
}

const monthShort = new Intl.DateTimeFormat(LOCALE, { timeZone: 'UTC', month: 'short' });
const monthLong = new Intl.DateTimeFormat(LOCALE, {
  timeZone: 'UTC',
  month: 'long',
  year: 'numeric',
});

/** "2026-10" → "Oct" (chart axis) */
export function formatMonthShort(monthKey: string): string {
  return monthShort.format(new Date(`${monthKey}-15T00:00:00Z`));
}

/** "2026-10" → "October 2026" */
export function formatMonthLong(monthKey: string): string {
  return monthLong.format(new Date(`${monthKey}-15T00:00:00Z`));
}
