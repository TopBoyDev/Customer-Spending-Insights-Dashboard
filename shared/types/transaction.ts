import type { CategoryIcon, CategoryName } from '../categories';

export type PaymentMethod = 'Credit Card' | 'Debit Card' | 'Debit Order';

export interface Transaction {
  id: string;
  /** ISO-8601 instant in UTC, e.g. 2024-09-16T14:30:00Z */
  date: string;
  merchant: string;
  category: CategoryName;
  /** Positive Rand amount of money spent. */
  amount: number;
  description: string;
  paymentMethod: PaymentMethod;
  icon: CategoryIcon;
  categoryColor: string;
}

export const SORT_OPTIONS = ['date_desc', 'date_asc', 'amount_desc', 'amount_asc'] as const;
export type TransactionSort = (typeof SORT_OPTIONS)[number];
export const DEFAULT_SORT: TransactionSort = 'date_desc';

export const DEFAULT_TRANSACTION_LIMIT = 20;
export const MAX_TRANSACTION_LIMIT = 100;

export interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/** GET /api/customers/{customerId}/transactions */
export interface PaginatedTransactions {
  transactions: Transaction[];
  pagination: Pagination;
}
