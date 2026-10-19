import type { CategoryName } from '../../shared/categories';
import { toLocalDate } from '../../shared/dates';
import type { DemoCustomer } from '../../server/data/demo-customer';
import type { LedgerEntry } from '../../server/data/demo-ledger';

let sequence = 0;

/** Builds a ledger entry; `date` is an ISO instant (UTC). */
export function entry(
  date: string,
  category: CategoryName,
  amountRand: number,
  overrides: Partial<LedgerEntry> = {},
): LedgerEntry {
  sequence += 1;
  return {
    id: `txn_${String(sequence).padStart(6, '0')}`,
    date,
    localDate: toLocalDate(date),
    merchant: 'Test Merchant',
    category,
    amountCents: Math.round(amountRand * 100),
    description: 'Test purchase',
    paymentMethod: 'Debit Card',
    ...overrides,
  };
}

export const testCustomer: DemoCustomer = {
  customerId: 'c-1',
  name: 'Test Customer',
  email: 'test@example.com',
  joinDate: '2024-01-01',
  accountType: 'standard',
  ledgerStartDate: '2024-01-01',
  monthlyBudgets: [
    { id: 'goal_a', category: 'Groceries', monthlyBudgetCents: 1_000_00 },
    { id: 'goal_b', category: 'Dining', monthlyBudgetCents: 500_00 },
  ],
};
