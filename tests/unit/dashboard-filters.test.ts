import { describe, expect, it } from 'vitest';
import { parseFilters, serializeFilters } from '../../src/hooks/useDashboardFilters';

describe('dashboard URL filters', () => {
  it('uses defaults for an empty query string', () => {
    expect(parseFilters('')).toEqual({
      period: '30d',
      months: 12,
      category: null,
      sortBy: 'date_desc',
      page: 1,
    });
  });

  it('parses valid values and normalises category case', () => {
    expect(
      parseFilters('?period=7d&months=24&category=groceries&sortBy=amount_asc&page=3'),
    ).toEqual({ period: '7d', months: 24, category: 'Groceries', sortBy: 'amount_asc', page: 3 });
  });

  it('falls back to safe defaults for unknown or malformed values', () => {
    expect(parseFilters('?period=2w&months=7&category=Gambling&sortBy=random&page=-2')).toEqual(
      parseFilters(''),
    );
    expect(parseFilters('?page=1.5').page).toBe(1);
    expect(parseFilters('?page=abc').page).toBe(1);
  });

  it('omits defaults when serialising and round-trips', () => {
    expect(serializeFilters(parseFilters(''))).toBe('');
    const filters = parseFilters('?period=90d&category=Dining&page=2');
    expect(serializeFilters(filters)).toBe('?period=90d&category=Dining&page=2');
    expect(parseFilters(serializeFilters(filters))).toEqual(filters);
  });
});
