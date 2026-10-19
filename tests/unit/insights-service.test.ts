import { describe, expect, it } from 'vitest';
import { PERIODS } from '../../shared/types';
import { createDemoService } from '../../server/create-demo-service';
import { DEMO_CUSTOMER, DEMO_SEED } from '../../server/data/demo-customer';
import { generateLedger } from '../../server/data/demo-ledger';
import { createInsightsService } from '../../server/services/insights-service';
import { entry, testCustomer } from '../fixtures/ledger';

const REFERENCE_DATE = '2026-10-19';

function serviceWith(ledger: ReturnType<typeof entry>[]) {
  return createInsightsService({ customer: testCustomer, ledger, referenceDate: REFERENCE_DATE });
}

describe('insights service with a hand-built ledger', () => {
  const ledger = [
    // Previous 7-day window: 2026-10-06 .. 2026-10-12
    entry('2026-10-08T10:00:00Z', 'Groceries', 200),
    // Current 7-day window: 2026-10-13 .. 2026-10-19
    entry('2026-10-13T08:00:00Z', 'Groceries', 100),
    entry('2026-10-15T08:00:00Z', 'Dining', 50.25),
    entry('2026-10-19T20:00:00Z', 'Groceries', 100),
    // After the reference date: must never appear.
    entry('2026-10-20T08:00:00Z', 'Shopping', 9999),
  ];
  const service = serviceWith(ledger);

  it('summarises the period and compares with the previous equal-length period', () => {
    expect(service.getSummary('7d')).toEqual({
      period: '7d',
      totalSpent: 250.25,
      transactionCount: 3,
      averageTransaction: 83.42,
      topCategory: 'Groceries',
      comparedToPrevious: { spentChange: 25.1, transactionChange: 200 },
    });
  });

  it('breaks spending down by category with percentages of the total', () => {
    const result = service.getCategoriesForPeriod('7d');
    expect(result.dateRange).toEqual({ startDate: '2026-10-13', endDate: '2026-10-19' });
    expect(result.totalAmount).toBe(250.25);
    expect(
      result.categories.map((c) => [c.name, c.amount, c.percentage, c.transactionCount]),
    ).toEqual([
      ['Groceries', 200, 79.9, 2],
      ['Dining', 50.25, 20.1, 1],
    ]);
    expect(result.categories[0]).toMatchObject({ color: '#FF6B6B', icon: 'shopping-cart' });
  });

  it('computes goals from month-to-date spending only', () => {
    const { goals } = service.getGoals();
    expect(goals).toEqual([
      {
        id: 'goal_a',
        category: 'Groceries',
        monthlyBudget: 1000,
        currentSpent: 400,
        percentageUsed: 40,
        daysRemaining: 12,
        status: 'on_track',
      },
      {
        id: 'goal_b',
        category: 'Dining',
        monthlyBudget: 500,
        currentSpent: 50.25,
        percentageUsed: 10.05,
        daysRemaining: 12,
        status: 'on_track',
      },
    ]);
  });

  it('ignores ledger entries after the reference date', () => {
    expect(service.getProfile().totalSpent).toBe(450.25);
    expect(
      service.getTransactions({ limit: 100, offset: 0, sortBy: 'date_desc' }).pagination.total,
    ).toBe(4);
  });
});

describe('zero-spend handling', () => {
  const service = serviceWith([]);

  it('returns explicit empty values instead of NaN or Infinity', () => {
    expect(service.getSummary('30d')).toEqual({
      period: '30d',
      totalSpent: 0,
      transactionCount: 0,
      averageTransaction: 0,
      topCategory: null,
      comparedToPrevious: { spentChange: null, transactionChange: null },
    });
    expect(service.getCategoriesForPeriod('30d').categories).toEqual([]);
    expect(
      service.getTrends(3).trends.every((t) => t.totalSpent === 0 && t.averageTransaction === 0),
    ).toBe(true);
  });
});

describe('demo dataset', () => {
  const service = createDemoService(REFERENCE_DATE);

  it('is deterministic across generations', () => {
    const options = {
      seed: DEMO_SEED,
      startDate: DEMO_CUSTOMER.ledgerStartDate,
      endDate: REFERENCE_DATE,
    };
    expect(generateLedger(options)).toEqual(generateLedger(options));
  });

  it.each(PERIODS)('agrees across summary, categories and transactions for %s', (period) => {
    const summary = service.getSummary(period);
    const categories = service.getCategoriesForPeriod(period);
    const range = service.resolvePeriod(period);
    const transactions = service.getTransactions({
      ...range,
      limit: 100,
      offset: 0,
      sortBy: 'date_desc',
    });

    expect(categories.totalAmount).toBe(summary.totalSpent);
    expect(categories.categories.reduce((n, c) => n + c.transactionCount, 0)).toBe(
      summary.transactionCount,
    );
    expect(transactions.pagination.total).toBe(summary.transactionCount);
    expect(categories.categories[0]?.name).toBe(summary.topCategory);

    const percentageTotal = categories.categories.reduce((sum, c) => sum + c.percentage, 0);
    expect(percentageTotal).toBeGreaterThan(99.5);
    expect(percentageTotal).toBeLessThan(100.5);
  });

  it('covers the 24-month trend window with spending in every month', () => {
    const { trends } = service.getTrends(24);
    expect(trends).toHaveLength(24);
    expect(trends[0]?.month).toBe('2024-11');
    expect(trends.at(-1)?.month).toBe('2026-10');
    expect(trends.every((t) => t.transactionCount > 0)).toBe(true);
  });

  it('includes on-track, warning and exceeded goals for a meaningful demo', () => {
    const statuses = new Set(service.getGoals().goals.map((g) => g.status));
    expect(statuses).toEqual(new Set(['on_track', 'warning', 'exceeded']));
  });

  it('pages through a filtered, sorted result without duplicates', () => {
    const base = {
      limit: 7,
      sortBy: 'amount_desc' as const,
      category: 'Groceries' as const,
      startDate: '2026-01-01',
    };
    const total = service.getTransactions({ ...base, offset: 0 }).pagination.total;
    const ids: string[] = [];
    for (let offset = 0; offset < total; offset += base.limit) {
      ids.push(...service.getTransactions({ ...base, offset }).transactions.map((t) => t.id));
    }
    expect(ids).toHaveLength(total);
    expect(new Set(ids).size).toBe(total);
  });
});
