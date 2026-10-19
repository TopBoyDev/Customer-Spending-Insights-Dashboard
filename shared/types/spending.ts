import type { CategoryIcon, CategoryName } from '../categories';

export const PERIODS = ['7d', '30d', '90d', '1y'] as const;
export type Period = (typeof PERIODS)[number];
export const DEFAULT_PERIOD: Period = '30d';

export interface DateRange {
  /** YYYY-MM-DD, inclusive, Africa/Johannesburg calendar date */
  startDate: string;
  /** YYYY-MM-DD, inclusive, Africa/Johannesburg calendar date */
  endDate: string;
}

/** GET /api/customers/{customerId}/spending/summary */
export interface SpendingSummary {
  period: Period;
  totalSpent: number;
  transactionCount: number;
  averageTransaction: number;
  /** `null` when there is no spending in the period. */
  topCategory: CategoryName | null;
  comparedToPrevious: {
    /** Percentage change; `null` when the previous period had no spending. */
    spentChange: number | null;
    /** Percentage change; `null` when the previous period had no transactions. */
    transactionChange: number | null;
  };
}

export interface CategorySpending {
  name: CategoryName;
  amount: number;
  percentage: number;
  transactionCount: number;
  color: string;
  icon: CategoryIcon;
}

/** GET /api/customers/{customerId}/spending/categories */
export interface SpendingByCategory {
  dateRange: DateRange;
  totalAmount: number;
  categories: CategorySpending[];
}

export interface MonthlyTrend {
  /** YYYY-MM */
  month: string;
  totalSpent: number;
  transactionCount: number;
  averageTransaction: number;
}

export const MAX_TREND_MONTHS = 24;
export const DEFAULT_TREND_MONTHS = 12;

/** GET /api/customers/{customerId}/spending/trends */
export interface SpendingTrends {
  trends: MonthlyTrend[];
}
