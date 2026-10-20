export const VIEWS = ['overview', 'categories', 'trends', 'transactions', 'budgets'] as const;
export type View = (typeof VIEWS)[number];
export const DEFAULT_VIEW: View = 'overview';

export const VIEW_LABEL: Record<View, string> = {
  overview: 'Overview',
  categories: 'Categories',
  trends: 'Trends',
  transactions: 'Transactions',
  budgets: 'Budgets',
};

export function isView(value: string | null): value is View {
  return (VIEWS as readonly string[]).includes(value ?? '');
}
