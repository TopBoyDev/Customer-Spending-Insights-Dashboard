import type { CategoryName } from '../../shared/categories';
import type { AccountType } from '../../shared/types';

/**
 * Frozen demo clock. The demo data ends on this Africa/Johannesburg calendar
 * date so that screenshots, numbers and tests are reproducible. Override with
 * the DEMO_REFERENCE_DATE environment variable if needed.
 */
export const DEFAULT_REFERENCE_DATE = '2026-10-19';

export const DEMO_SEED = 20_261_019;

/** Fictional customer. Any resemblance to a real person is coincidental. */
export interface DemoCustomer {
  customerId: string;
  name: string;
  email: string;
  joinDate: string;
  accountType: AccountType;
  /** First day of the generated ledger. */
  ledgerStartDate: string;
  monthlyBudgets: { id: string; category: CategoryName; monthlyBudgetCents: number }[];
}

export const DEMO_CUSTOMER: DemoCustomer = {
  customerId: '12345',
  name: 'Lerato Mokoena',
  email: 'lerato.mokoena@example.com',
  joinDate: '2024-07-01',
  accountType: 'premium',
  ledgerStartDate: '2024-07-01',
  monthlyBudgets: [
    { id: 'goal_001', category: 'Entertainment', monthlyBudgetCents: 1_000_00 },
    { id: 'goal_002', category: 'Groceries', monthlyBudgetCents: 5_000_00 },
    { id: 'goal_003', category: 'Dining', monthlyBudgetCents: 2_000_00 },
    { id: 'goal_004', category: 'Transportation', monthlyBudgetCents: 3_500_00 },
  ],
};
