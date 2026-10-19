import { CATEGORIES, CATEGORY_BY_NAME, type CategoryName } from '../../shared/categories';
import { APP_TIMEZONE, daysInMonth, toMonthKey } from '../../shared/dates';
import type {
  ApiMeta,
  CustomerProfile,
  DateRange,
  FiltersResponse,
  PaginatedTransactions,
  Period,
  SpendingByCategory,
  SpendingGoals,
  SpendingSummary,
  SpendingTrends,
  Transaction,
  TransactionSort,
} from '../../shared/types';
import type { DemoCustomer } from '../data/demo-customer';
import type { LedgerEntry } from '../data/demo-ledger';
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
  sumCents,
  type DateFilter,
} from '../utils/analytics';
import { centsToRand, roundTo } from '../utils/money';
import { previousRange, resolvePeriod } from '../utils/period';

export interface TransactionQuery extends DateFilter {
  limit: number;
  offset: number;
  sortBy: TransactionSort;
  category?: CategoryName | undefined;
}

const PERIOD_LABELS: Record<Period, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  '1y': 'Last year',
};

function toTransaction(entry: LedgerEntry): Transaction {
  const meta = CATEGORY_BY_NAME[entry.category];
  return {
    id: entry.id,
    date: entry.date,
    merchant: entry.merchant,
    category: entry.category,
    amount: centsToRand(entry.amountCents),
    description: entry.description,
    paymentMethod: entry.paymentMethod,
    icon: meta.icon,
    categoryColor: meta.color,
  };
}

/**
 * All endpoint responses are derived from one ledger and one reference date,
 * so totals always agree across endpoints for the same filters. Route handlers
 * only validate input and call these methods; swapping this service for an
 * upstream API client would not change the HTTP layer.
 */
export function createInsightsService(options: {
  customer: DemoCustomer;
  ledger: readonly LedgerEntry[];
  referenceDate: string;
}) {
  const { customer, referenceDate } = options;
  // Never expose data "from the future" relative to the demo clock.
  const ledger = options.ledger.filter((entry) => entry.localDate <= referenceDate);

  function hasCustomer(customerId: string): boolean {
    return customerId === customer.customerId;
  }

  function getMeta(): ApiMeta {
    return { dataAsOf: referenceDate, timezone: APP_TIMEZONE, currency: 'ZAR' };
  }

  function getProfile(): CustomerProfile {
    return {
      customerId: customer.customerId,
      name: customer.name,
      email: customer.email,
      joinDate: customer.joinDate,
      accountType: customer.accountType,
      totalSpent: centsToRand(sumCents(ledger)),
      currency: 'ZAR',
    };
  }

  function getSummary(period: Period): SpendingSummary {
    const range = resolvePeriod(period, referenceDate);
    const current = filterByDate(ledger, range);
    const previous = filterByDate(ledger, previousRange(range));
    const totalCents = sumCents(current);

    return {
      period,
      totalSpent: centsToRand(totalCents),
      transactionCount: current.length,
      averageTransaction: averageRand(totalCents, current.length),
      topCategory: aggregateByCategory(current)[0]?.name ?? null,
      comparedToPrevious: {
        spentChange: percentageChange(totalCents, sumCents(previous)),
        transactionChange: percentageChange(current.length, previous.length),
      },
    };
  }

  function getCategories(range: DateRange): SpendingByCategory {
    const entries = filterByDate(ledger, range);
    const totalCents = sumCents(entries);
    return {
      dateRange: range,
      totalAmount: centsToRand(totalCents),
      categories: aggregateByCategory(entries).map((total) => ({
        name: total.name,
        amount: centsToRand(total.amountCents),
        percentage: roundTo(percentageOf(total.amountCents, totalCents), 1),
        transactionCount: total.transactionCount,
        color: CATEGORY_BY_NAME[total.name].color,
        icon: CATEGORY_BY_NAME[total.name].icon,
      })),
    };
  }

  function getCategoriesForPeriod(period: Period): SpendingByCategory {
    return getCategories(resolvePeriod(period, referenceDate));
  }

  function getTrends(months: number): SpendingTrends {
    return {
      trends: aggregateByMonth(ledger, toMonthKey(referenceDate), months).map((month) => ({
        month: month.month,
        totalSpent: centsToRand(month.totalCents),
        transactionCount: month.transactionCount,
        averageTransaction: averageRand(month.totalCents, month.transactionCount),
      })),
    };
  }

  function getTransactions(query: TransactionQuery): PaginatedTransactions {
    const byDate = filterByDate(ledger, query);
    const filtered = query.category
      ? byDate.filter((entry) => entry.category === query.category)
      : byDate;
    const { page, pagination } = paginate(
      sortTransactions(filtered, query.sortBy),
      query.limit,
      query.offset,
    );
    return { transactions: page.map(toTransaction), pagination };
  }

  function getGoals(): SpendingGoals {
    const month = toMonthKey(referenceDate);
    const monthToDate = filterByDate(ledger, { startDate: `${month}-01`, endDate: referenceDate });
    const daysRemaining = daysInMonth(month) - Number(referenceDate.slice(8, 10));

    return {
      goals: customer.monthlyBudgets.map((budget) => {
        const spentCents = sumCents(
          monthToDate.filter((entry) => entry.category === budget.category),
        );
        const percentageUsed = roundTo(percentageOf(spentCents, budget.monthlyBudgetCents), 2);
        return {
          id: budget.id,
          category: budget.category,
          monthlyBudget: centsToRand(budget.monthlyBudgetCents),
          currentSpent: centsToRand(spentCents),
          percentageUsed,
          daysRemaining,
          status: goalStatus(percentageUsed),
        };
      }),
    };
  }

  function getFilters(): FiltersResponse {
    return {
      categories: CATEGORIES.map((category) => ({ ...category })),
      dateRangePresets: (Object.keys(PERIOD_LABELS) as Period[]).map((value) => ({
        label: PERIOD_LABELS[value],
        value,
      })),
    };
  }

  return {
    hasCustomer,
    getMeta,
    getProfile,
    getSummary,
    getCategories,
    getCategoriesForPeriod,
    getTrends,
    getTransactions,
    getGoals,
    getFilters,
    resolvePeriod: (period: Period) => resolvePeriod(period, referenceDate),
  };
}

export type InsightsService = ReturnType<typeof createInsightsService>;
