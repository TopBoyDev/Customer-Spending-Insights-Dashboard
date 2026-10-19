export type AccountType = 'standard' | 'premium';

/** GET /api/customers/{customerId}/profile */
export interface CustomerProfile {
  customerId: string;
  name: string;
  email: string;
  /** YYYY-MM-DD */
  joinDate: string;
  accountType: AccountType;
  /** Lifetime spending in Rand (not period-specific). */
  totalSpent: number;
  currency: 'ZAR';
}
