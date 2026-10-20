import { describe, expect, it } from 'vitest';
import { en, plural } from '../../src/i18n/en';
import { summariseTrends } from '../../src/utils/insights';

describe('plural', () => {
  it('chooses the CLDR plural form and substitutes the count', () => {
    const forms = { one: '{count} day left', other: '{count} days left' };
    expect(plural(1, forms)).toBe('1 day left');
    expect(plural(0, forms)).toBe('0 days left');
    expect(plural(12, forms)).toBe('12 days left');
  });

  it('can substitute a pre-formatted number', () => {
    expect(plural(1250, { one: '{count} item', other: '{count} items' }, '1 250')).toBe(
      '1 250 items',
    );
  });
});

describe('English catalogue', () => {
  it('pluralises counts instead of hard-coding "s"', () => {
    expect(en.transactions.count(1, '1')).toBe('1 transaction');
    expect(en.transactions.count(45, '45')).toBe('45 transactions');
    expect(en.budgets.daysLeft(1)).toBe('1 day left');
    expect(en.budgets.categoryCount(4)).toBe('4 categories');
    expect(en.trends.overCompleteMonths(1)).toBe('Over 1 complete month');
  });

  it('feeds pluralised copy into derived insights', () => {
    const insight = summariseTrends(
      [
        { month: '2026-09', totalSpent: 1000, transactionCount: 3, averageTransaction: 333.33 },
        { month: '2026-10', totalSpent: 100, transactionCount: 1, averageTransaction: 100 },
      ],
      '2026-10',
    );
    expect(insight.sentences[0]).toMatch(/over 1 complete month\.$/);
  });

  it('has copy for every period, sort order and goal status', () => {
    expect(Object.keys(en.period.last)).toEqual(['7d', '30d', '90d', '1y']);
    expect(Object.keys(en.transactions.sort)).toHaveLength(4);
    expect(Object.keys(en.budgets.status)).toEqual(['on_track', 'warning', 'exceeded']);
  });
});
