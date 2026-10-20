import { describe, expect, it } from 'vitest';
import type { MonthlyTrend } from '../../shared/types';
import {
  formatCalendarDate,
  formatCurrency,
  formatCurrencyAxis,
  formatMonthLong,
  formatPercent,
  formatTransactionDate,
  formatTransactionTime,
} from '../../src/utils/format';
import {
  describeCountChange,
  describeSpendingChange,
  summariseTrends,
} from '../../src/utils/insights';
import { groupByDay } from '../../src/utils/transactions';

/** Intl uses non-breaking spaces as en-ZA group separators. */
const normalise = (value: string) => value.replace(/\s/g, ' ');

describe('formatting', () => {
  it('formats Rand using South African conventions', () => {
    expect(normalise(formatCurrency(4250.75))).toBe('R 4 250,75');
    expect(normalise(formatCurrency(0))).toBe('R 0,00');
    expect(formatCurrencyAxis(4300)).toBe('R4,3k');
    expect(formatCurrencyAxis(850)).toBe('R850');
  });

  it('formats percentages with at most one decimal', () => {
    expect(formatPercent(12.5)).toBe('12,5%');
    expect(formatPercent(100)).toBe('100%');
  });

  it('renders calendar dates and transaction times in Johannesburg time', () => {
    expect(formatCalendarDate('2026-10-19')).toMatch(/^19 Oct/);
    // 22:30 UTC on the 15th is 00:30 on the 16th in Johannesburg.
    expect(formatTransactionDate('2024-09-15T22:30:00Z')).toMatch(/^16 Sep/);
    expect(formatTransactionTime('2024-09-15T22:30:00Z')).toBe('00:30');
    expect(formatMonthLong('2026-02')).toBe('February 2026');
  });
});

describe('change descriptions', () => {
  it('describes direction and basis in neutral language', () => {
    expect(describeSpendingChange(12.5, '30d')).toEqual({
      direction: 'up',
      text: '12,5% more than the previous 30 days',
    });
    expect(describeSpendingChange(-3.2, '7d').text).toBe('3,2% less than the previous 7 days');
    expect(describeSpendingChange(0, '1y').text).toBe('The same as the year before');
    expect(describeCountChange(-20).text).toBe('20% fewer');
    expect(describeCountChange(null).text).toBe('Nothing to compare');
  });

  it('explains when there is nothing to compare with', () => {
    expect(describeSpendingChange(null, '90d')).toEqual({
      direction: 'none',
      text: 'No spending in the previous 90 days to compare with',
    });
  });
});

describe('summariseTrends', () => {
  const month = (key: string, totalSpent: number, transactionCount = 1): MonthlyTrend => ({
    month: key,
    totalSpent,
    transactionCount,
    averageTransaction: transactionCount ? totalSpent / transactionCount : 0,
  });

  it('excludes the in-progress month from averages and comparisons', () => {
    const result = summariseTrends(
      [month('2026-08', 1000), month('2026-09', 1500), month('2026-10', 100)],
      '2026-10',
    );
    expect(result.averageMonthly).toBe(1250);
    expect(result.highest?.month).toBe('2026-09');
    expect(result.lowest?.month).toBe('2026-08');
    expect(result.sentences.at(-1)).toBe('September 2026 was 50% higher than August 2026.');
  });

  it('handles months without spending', () => {
    const result = summariseTrends([month('2026-09', 0, 0), month('2026-10', 0, 0)], '2026-10');
    expect(result.averageMonthly).toBeNull();
    expect(result.sentences).toEqual([
      'There is not enough complete-month spending yet to show a trend.',
    ]);
  });
});

describe('groupByDay', () => {
  it('groups by Johannesburg calendar day, preserving order', () => {
    const base = {
      merchant: 'M',
      category: 'Dining' as const,
      amount: 1,
      description: '',
      paymentMethod: 'Debit Card' as const,
      icon: 'utensils' as const,
      categoryColor: '#F7DC6F',
    };
    const groups = groupByDay([
      { ...base, id: 'a', date: '2026-10-16T08:00:00Z' },
      { ...base, id: 'b', date: '2026-10-15T22:30:00Z' }, // 00:30 on the 16th locally
      { ...base, id: 'c', date: '2026-10-15T08:00:00Z' },
    ]);
    expect(groups.map((g) => [g.date, g.transactions.map((t) => t.id)])).toEqual([
      ['2026-10-16', ['a', 'b']],
      ['2026-10-15', ['c']],
    ]);
  });
});
