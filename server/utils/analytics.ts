import { CATEGORIES, type CategoryName } from '../../shared/categories';
import { addMonths, toMonthKey } from '../../shared/dates';
import {
  GOAL_EXCEEDED_THRESHOLD,
  GOAL_WARNING_THRESHOLD,
  type GoalStatus,
  type TransactionSort,
} from '../../shared/types';
import type { LedgerEntry } from '../data/demo-ledger';
import { roundTo } from './money';

export interface DateFilter {
  startDate?: string | undefined;
  endDate?: string | undefined;
}

/** Inclusive filter on the Africa/Johannesburg calendar date. */
export function filterByDate(entries: readonly LedgerEntry[], { startDate, endDate }: DateFilter) {
  return entries.filter(
    (entry) =>
      (startDate === undefined || entry.localDate >= startDate) &&
      (endDate === undefined || entry.localDate <= endDate),
  );
}

export function sumCents(entries: readonly LedgerEntry[]): number {
  return entries.reduce((total, entry) => total + entry.amountCents, 0);
}

/** Average in Rand, or 0 when there are no transactions. */
export function averageRand(totalCents: number, count: number): number {
  return count === 0 ? 0 : roundTo(totalCents / count / 100, 2);
}

/** Percentage of `part` in `whole`, or 0 when `whole` is 0. Not rounded. */
export function percentageOf(part: number, whole: number): number {
  return whole === 0 ? 0 : (part / whole) * 100;
}

/**
 * Percentage change from `previous` to `current`, rounded to one decimal.
 * Returns `null` when there is nothing to compare against (previous is 0),
 * so the UI can say so instead of rendering `Infinity%`.
 */
export function percentageChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return roundTo(((current - previous) / previous) * 100, 1);
}

export interface CategoryTotal {
  name: CategoryName;
  amountCents: number;
  transactionCount: number;
}

/**
 * Totals per category, largest first. Categories without spending are omitted.
 * Ties are broken by the canonical category order so the result is stable.
 */
export function aggregateByCategory(entries: readonly LedgerEntry[]): CategoryTotal[] {
  const totals = new Map<CategoryName, CategoryTotal>();
  for (const entry of entries) {
    const current = totals.get(entry.category) ?? {
      name: entry.category,
      amountCents: 0,
      transactionCount: 0,
    };
    current.amountCents += entry.amountCents;
    current.transactionCount += 1;
    totals.set(entry.category, current);
  }
  const order = CATEGORIES.map((category) => category.name);
  return [...totals.values()].sort(
    (a, b) => b.amountCents - a.amountCents || order.indexOf(a.name) - order.indexOf(b.name),
  );
}

export interface MonthTotal {
  month: string;
  totalCents: number;
  transactionCount: number;
}

/** Totals for `months` consecutive calendar months ending with `endMonth`, oldest first. */
export function aggregateByMonth(
  entries: readonly LedgerEntry[],
  endMonth: string,
  months: number,
): MonthTotal[] {
  const firstMonth = addMonths(endMonth, -(months - 1));
  const buckets = new Map<string, MonthTotal>();
  for (let index = 0; index < months; index += 1) {
    const month = addMonths(firstMonth, index);
    buckets.set(month, { month, totalCents: 0, transactionCount: 0 });
  }
  for (const entry of entries) {
    const bucket = buckets.get(toMonthKey(entry.localDate));
    if (bucket) {
      bucket.totalCents += entry.amountCents;
      bucket.transactionCount += 1;
    }
  }
  return [...buckets.values()];
}

export function goalStatus(percentageUsed: number): GoalStatus {
  if (percentageUsed > GOAL_EXCEEDED_THRESHOLD) return 'exceeded';
  if (percentageUsed >= GOAL_WARNING_THRESHOLD) return 'warning';
  return 'on_track';
}

/**
 * Sorts without mutating. Every order has the transaction id as a final
 * tie-breaker, so pagination never duplicates or skips rows.
 */
export function sortTransactions(entries: readonly LedgerEntry[], sortBy: TransactionSort) {
  const byIdAsc = (a: LedgerEntry, b: LedgerEntry) => a.id.localeCompare(b.id);
  const comparators: Record<TransactionSort, (a: LedgerEntry, b: LedgerEntry) => number> = {
    date_desc: (a, b) => b.date.localeCompare(a.date) || byIdAsc(b, a),
    date_asc: (a, b) => a.date.localeCompare(b.date) || byIdAsc(a, b),
    amount_desc: (a, b) => b.amountCents - a.amountCents || byIdAsc(b, a),
    amount_asc: (a, b) => a.amountCents - b.amountCents || byIdAsc(a, b),
  };
  return [...entries].sort(comparators[sortBy]);
}

export function paginate<T>(items: readonly T[], limit: number, offset: number) {
  return {
    page: items.slice(offset, offset + limit),
    pagination: {
      total: items.length,
      limit,
      offset,
      hasMore: offset + limit < items.length,
    },
  };
}
