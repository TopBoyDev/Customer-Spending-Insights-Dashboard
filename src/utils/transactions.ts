import { toLocalDate } from '../../shared/dates';
import type { Transaction } from '../../shared/types';

export interface DayGroup {
  date: string;
  transactions: Transaction[];
}

/** Groups consecutive transactions by Johannesburg calendar day, preserving the sort order. */
export function groupByDay(transactions: readonly Transaction[]): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const transaction of transactions) {
    const date = toLocalDate(transaction.date);
    const last = groups.at(-1);
    if (last && last.date === date) last.transactions.push(transaction);
    else groups.push({ date, transactions: [transaction] });
  }
  return groups;
}
