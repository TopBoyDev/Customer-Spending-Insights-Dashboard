import { APP_TIMEZONE } from '../../shared/dates';
import type { Period, TransactionSort } from '../../shared/types';

const LOCALE = 'en-ZA';

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

export const PERIOD_LABEL: Record<Period, string> = {
  '7d': 'last 7 days',
  '30d': 'last 30 days',
  '90d': 'last 90 days',
  '1y': 'last year',
};

/** Basis for comparison copy, e.g. "the previous 30 days". */
export const PREVIOUS_PERIOD_LABEL: Record<Period, string> = {
  '7d': 'the previous 7 days',
  '30d': 'the previous 30 days',
  '90d': 'the previous 90 days',
  '1y': 'the year before',
};

export const PERIOD_SHORT_LABEL: Record<Period, string> = {
  '7d': '7 days',
  '30d': '30 days',
  '90d': '90 days',
  '1y': '1 year',
};

export const SORT_LABELS: Record<TransactionSort, string> = {
  date_desc: 'Newest first',
  date_asc: 'Oldest first',
  amount_desc: 'Highest amount',
  amount_asc: 'Lowest amount',
};
