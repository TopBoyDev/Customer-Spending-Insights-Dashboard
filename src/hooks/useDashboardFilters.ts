import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { findCategoryName, type CategoryName } from '../../shared/categories';
import {
  DEFAULT_PERIOD,
  DEFAULT_SORT,
  PERIODS,
  SORT_OPTIONS,
  type Period,
  type TransactionSort,
} from '../../shared/types';
import { DEFAULT_VIEW, isView, type View } from '../navigation';

export const TREND_MONTH_OPTIONS = [6, 12, 24] as const;
export type TrendMonths = (typeof TREND_MONTH_OPTIONS)[number];
export const DEFAULT_TREND_MONTH_OPTION: TrendMonths = 12;

export interface DashboardFilters {
  view: View;
  period: Period;
  months: TrendMonths;
  category: CategoryName | null;
  sortBy: TransactionSort;
  page: number;
}

const DEFAULTS: DashboardFilters = {
  view: DEFAULT_VIEW,
  period: DEFAULT_PERIOD,
  months: DEFAULT_TREND_MONTH_OPTION,
  category: null,
  sortBy: DEFAULT_SORT,
  page: 1,
};

/** Parses URL search params. Unknown or malformed values fall back to safe defaults. */
export function parseFilters(search: string): DashboardFilters {
  const params = new URLSearchParams(search);
  const view = params.get('view');
  const period = params.get('period');
  const months = Number(params.get('months'));
  const category = params.get('category');
  const sortBy = params.get('sortBy');
  const page = Number(params.get('page'));

  return {
    view: isView(view) ? view : DEFAULTS.view,
    period: (PERIODS as readonly string[]).includes(period ?? '')
      ? (period as Period)
      : DEFAULTS.period,
    months: (TREND_MONTH_OPTIONS as readonly number[]).includes(months)
      ? (months as TrendMonths)
      : DEFAULTS.months,
    category: category ? (findCategoryName(category) ?? null) : null,
    sortBy: (SORT_OPTIONS as readonly string[]).includes(sortBy ?? '')
      ? (sortBy as TransactionSort)
      : DEFAULTS.sortBy,
    page: Number.isSafeInteger(page) && page >= 1 ? page : DEFAULTS.page,
  };
}

/** Serialises filters, omitting defaults to keep shared URLs short. */
export function serializeFilters(filters: DashboardFilters): string {
  const params = new URLSearchParams();
  if (filters.view !== DEFAULTS.view) params.set('view', filters.view);
  if (filters.period !== DEFAULTS.period) params.set('period', filters.period);
  if (filters.months !== DEFAULTS.months) params.set('months', String(filters.months));
  if (filters.category) params.set('category', filters.category);
  if (filters.sortBy !== DEFAULTS.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.page !== DEFAULTS.page) params.set('page', String(filters.page));
  const query = params.toString();
  return query ? `?${query}` : '';
}

const URL_CHANGE_EVENT = 'dashboard-filters-change';

function subscribe(callback: () => void) {
  window.addEventListener('popstate', callback);
  window.addEventListener(URL_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener('popstate', callback);
    window.removeEventListener(URL_CHANGE_EVENT, callback);
  };
}

const getSearch = () => window.location.search;

export interface UpdateOptions {
  /**
   * Push a new history entry (used when switching tabs, so the browser back
   * button returns to the previous tab). Filter tweaks replace the entry.
   */
  push?: boolean;
}

/**
 * Dashboard state (active tab and filters) lives in the URL so any view
 * survives a refresh and can be shared. Changing any filter that affects the
 * transaction result set returns pagination to page 1.
 */
export function useDashboardFilters() {
  const search = useSyncExternalStore(subscribe, getSearch, () => '');
  const filters = useMemo(() => parseFilters(search), [search]);

  const update = useCallback((changes: Partial<DashboardFilters>, options: UpdateOptions = {}) => {
    const current = parseFilters(window.location.search);
    const resetsPage =
      ('period' in changes && changes.period !== current.period) ||
      ('category' in changes && changes.category !== current.category) ||
      ('sortBy' in changes && changes.sortBy !== current.sortBy);
    const next: DashboardFilters = {
      ...current,
      ...changes,
      page: changes.page ?? (resetsPage ? 1 : current.page),
    };
    const url = `${window.location.pathname}${serializeFilters(next)}`;
    if (options.push) window.history.pushState(null, '', url);
    else window.history.replaceState(window.history.state, '', url);
    window.dispatchEvent(new Event(URL_CHANGE_EVENT));
  }, []);

  return { filters, update };
}

/** Builds the URL for a view, keeping the current filters (for real links). */
export function hrefForView(view: View, search: string): string {
  return serializeFilters({ ...parseFilters(search), view }) || '?';
}
