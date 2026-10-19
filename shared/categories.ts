export const CATEGORY_NAMES = [
  'Groceries',
  'Entertainment',
  'Transportation',
  'Dining',
  'Shopping',
  'Utilities',
] as const;

export type CategoryName = (typeof CATEGORY_NAMES)[number];

export type CategoryIcon = 'shopping-cart' | 'film' | 'car' | 'utensils' | 'shopping-bag' | 'zap';

export interface CategoryMeta {
  name: CategoryName;
  color: string;
  icon: CategoryIcon;
}

/** Colours and icon names exactly as specified in the API contract. */
export const CATEGORIES: readonly CategoryMeta[] = [
  { name: 'Groceries', color: '#FF6B6B', icon: 'shopping-cart' },
  { name: 'Entertainment', color: '#4ECDC4', icon: 'film' },
  { name: 'Transportation', color: '#45B7D1', icon: 'car' },
  { name: 'Dining', color: '#F7DC6F', icon: 'utensils' },
  { name: 'Shopping', color: '#BB8FCE', icon: 'shopping-bag' },
  { name: 'Utilities', color: '#85C1E9', icon: 'zap' },
];

export const CATEGORY_BY_NAME: Readonly<Record<CategoryName, CategoryMeta>> = Object.fromEntries(
  CATEGORIES.map((category) => [category.name, category]),
) as Record<CategoryName, CategoryMeta>;

export function isCategoryName(value: string): value is CategoryName {
  return (CATEGORY_NAMES as readonly string[]).includes(value);
}

/** Case-insensitive lookup, returning the canonical category name. */
export function findCategoryName(value: string): CategoryName | undefined {
  const lower = value.trim().toLowerCase();
  return CATEGORY_NAMES.find((name) => name.toLowerCase() === lower);
}
