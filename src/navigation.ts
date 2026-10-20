export const VIEWS = ['overview', 'categories', 'trends', 'transactions', 'budgets'] as const;
export type View = (typeof VIEWS)[number];
export const DEFAULT_VIEW: View = 'overview';

export function isView(value: string | null): value is View {
  return (VIEWS as readonly string[]).includes(value ?? '');
}
