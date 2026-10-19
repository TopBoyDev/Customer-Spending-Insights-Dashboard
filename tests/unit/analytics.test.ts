import { describe, expect, it } from 'vitest';
import {
  aggregateByCategory,
  aggregateByMonth,
  averageRand,
  filterByDate,
  goalStatus,
  paginate,
  percentageChange,
  percentageOf,
  sortTransactions,
} from '../../server/utils/analytics';
import { roundTo } from '../../server/utils/money';
import { previousRange, rangeLength, resolvePeriod } from '../../server/utils/period';
import { entry } from '../fixtures/ledger';

describe('periods', () => {
  it('resolves each preset as an inclusive range ending on the reference date', () => {
    expect(resolvePeriod('7d', '2026-10-19')).toEqual({
      startDate: '2026-10-13',
      endDate: '2026-10-19',
    });
    expect(rangeLength(resolvePeriod('30d', '2026-10-19'))).toBe(30);
    expect(rangeLength(resolvePeriod('90d', '2026-10-19'))).toBe(90);
    expect(rangeLength(resolvePeriod('1y', '2024-12-31'))).toBe(365);
  });

  it('compares against an equal-length period immediately before', () => {
    const current = resolvePeriod('30d', '2026-10-19');
    const previous = previousRange(current);
    expect(previous).toEqual({ startDate: '2026-08-21', endDate: '2026-09-19' });
    expect(rangeLength(previous)).toBe(rangeLength(current));
  });
});

describe('percentages and rounding', () => {
  it('returns null instead of Infinity when there is nothing to compare against', () => {
    expect(percentageChange(100, 0)).toBeNull();
    expect(percentageChange(0, 0)).toBeNull();
  });

  it('computes signed, one-decimal change', () => {
    expect(percentageChange(112.5, 100)).toBe(12.5);
    expect(percentageChange(50, 200)).toBe(-75);
    expect(percentageChange(100, 300)).toBe(-66.7);
  });

  it('guards division by zero for shares and averages', () => {
    expect(percentageOf(10, 0)).toBe(0);
    expect(averageRand(0, 0)).toBe(0);
    expect(averageRand(10_000, 3)).toBe(33.33);
  });

  it('rounds half away from zero', () => {
    expect(roundTo(1.005, 2)).toBe(1.01);
    expect(roundTo(-2.5, 0)).toBe(-3);
    expect(roundTo(1e-7, 2)).toBe(0);
    expect(roundTo(0, 2)).toBe(0);
  });
});

describe('filterByDate', () => {
  const entries = [
    entry('2026-10-12T21:59:00Z', 'Dining', 10), // 23:59 local on the 12th
    entry('2026-10-12T22:00:00Z', 'Dining', 20), // 00:00 local on the 13th
    entry('2026-10-19T21:00:00Z', 'Dining', 30), // 23:00 local on the 19th
    entry('2026-10-19T22:30:00Z', 'Dining', 40), // 00:30 local on the 20th
  ];

  it('uses inclusive Johannesburg calendar-day boundaries', () => {
    const result = filterByDate(entries, { startDate: '2026-10-13', endDate: '2026-10-19' });
    expect(result.map((e) => e.amountCents)).toEqual([2000, 3000]);
  });

  it('supports open-ended ranges', () => {
    expect(filterByDate(entries, { startDate: '2026-10-19' })).toHaveLength(2);
    expect(filterByDate(entries, {})).toHaveLength(4);
  });
});

describe('aggregateByCategory', () => {
  it('sums in cents, sorts by amount, and breaks ties by canonical order', () => {
    const result = aggregateByCategory([
      entry('2026-10-01T10:00:00Z', 'Dining', 0.1),
      entry('2026-10-01T10:00:00Z', 'Dining', 0.2),
      entry('2026-10-01T10:00:00Z', 'Groceries', 0.3),
      entry('2026-10-01T10:00:00Z', 'Utilities', 5),
    ]);
    expect(result).toEqual([
      { name: 'Utilities', amountCents: 500, transactionCount: 1 },
      // Equal totals: Groceries precedes Dining in the contract's category order.
      { name: 'Groceries', amountCents: 30, transactionCount: 1 },
      { name: 'Dining', amountCents: 30, transactionCount: 2 },
    ]);
  });

  it('returns an empty list for no transactions', () => {
    expect(aggregateByCategory([])).toEqual([]);
  });
});

describe('aggregateByMonth', () => {
  it('returns consecutive months, oldest first, including zero-spend months', () => {
    const result = aggregateByMonth(
      [entry('2026-08-10T10:00:00Z', 'Dining', 100), entry('2026-10-01T10:00:00Z', 'Dining', 50)],
      '2026-10',
      4,
    );
    expect(result).toEqual([
      { month: '2026-07', totalCents: 0, transactionCount: 0 },
      { month: '2026-08', totalCents: 10_000, transactionCount: 1 },
      { month: '2026-09', totalCents: 0, transactionCount: 0 },
      { month: '2026-10', totalCents: 5_000, transactionCount: 1 },
    ]);
  });
});

describe('goalStatus', () => {
  it.each([
    [0, 'on_track'],
    [79.99, 'on_track'],
    [80, 'warning'],
    [100, 'warning'],
    [100.01, 'exceeded'],
  ] as const)('%s%% used is %s', (percentage, status) => {
    expect(goalStatus(percentage)).toBe(status);
  });
});

describe('sorting and pagination', () => {
  const tied = [
    entry('2026-10-01T10:00:00Z', 'Dining', 50),
    entry('2026-10-01T10:00:00Z', 'Dining', 50),
    entry('2026-10-02T10:00:00Z', 'Dining', 10),
    entry('2026-09-30T10:00:00Z', 'Dining', 90),
  ];

  it('orders ties deterministically by id', () => {
    const ids = (sort: Parameters<typeof sortTransactions>[1]) =>
      sortTransactions(tied, sort).map((e) => e.id);
    const [a, b, c, d] = tied.map((e) => e.id);
    expect(ids('date_desc')).toEqual([c, b, a, d]);
    expect(ids('date_asc')).toEqual([d, a, b, c]);
    expect(ids('amount_desc')).toEqual([d, b, a, c]);
    expect(ids('amount_asc')).toEqual([c, a, b, d]);
  });

  it('does not mutate its input', () => {
    const before = tied.map((e) => e.id);
    sortTransactions(tied, 'amount_asc');
    expect(tied.map((e) => e.id)).toEqual(before);
  });

  it('pages without duplicates or gaps', () => {
    const items = Array.from({ length: 25 }, (_, index) => index);
    const pages = [0, 10, 20].map((offset) => paginate(items, 10, offset));
    expect(pages.flatMap((p) => p.page)).toEqual(items);
    expect(pages.map((p) => p.pagination.hasMore)).toEqual([true, true, false]);
    expect(paginate(items, 10, 40)).toEqual({
      page: [],
      pagination: { total: 25, limit: 10, offset: 40, hasMore: false },
    });
  });
});
