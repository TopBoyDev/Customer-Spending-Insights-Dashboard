import { lazy, Suspense, useCallback, useEffect, useRef } from 'react';
import type { CategoryName } from '../shared/categories';
import { AppShell } from './components/layout/AppShell';
import { PAGE_HEADING_ID } from './components/layout/PageHeader';
import { hrefForView, useDashboardFilters } from './hooks/useDashboardFilters';
import { useMessages } from './i18n/I18nProvider';
import { type View } from './navigation';
import { focusWhenAvailable } from './utils/focus';
import { OverviewView } from './views/OverviewView';
import { ViewSkeleton } from './views/ViewSkeleton';

// Detail views are code-split: the overview loads without them (or the chart library).
const CategoriesView = lazy(() =>
  import('./views/CategoriesView').then((module) => ({ default: module.CategoriesView })),
);
const TrendsView = lazy(() =>
  import('./views/TrendsView').then((module) => ({ default: module.TrendsView })),
);
const TransactionsView = lazy(() =>
  import('./views/TransactionsView').then((module) => ({ default: module.TransactionsView })),
);
const BudgetsView = lazy(() =>
  import('./views/BudgetsView').then((module) => ({ default: module.BudgetsView })),
);

export function App() {
  const m = useMessages();
  const { filters, update } = useDashboardFilters();
  const { view } = filters;

  const navigate = useCallback(
    (next: View, changes: Partial<typeof filters> = {}) => {
      update({ ...changes, view: next }, { push: next !== view });
    },
    [update, view],
  );

  // Behave like a page change: title, scroll position and focus follow the active tab.
  const previousView = useRef(view);
  useEffect(() => {
    document.title = `${m.views[view]} · ${m.app.name}`;
    if (previousView.current === view) return;
    previousView.current = view;
    window.scrollTo({ top: 0 });
    // Lazily loaded views mount a moment later, so wait for the new heading.
    return focusWhenAvailable(PAGE_HEADING_ID);
  }, [view, m]);

  const setPeriod = (period: typeof filters.period) => update({ period });

  let content: JSX.Element;
  switch (view) {
    case 'categories':
      content = (
        <CategoriesView
          period={filters.period}
          onPeriodChange={setPeriod}
          onSelectCategory={(category: CategoryName) =>
            navigate('transactions', { category, page: 1 })
          }
        />
      );
      break;
    case 'trends':
      content = (
        <TrendsView months={filters.months} onMonthsChange={(months) => update({ months })} />
      );
      break;
    case 'transactions':
      content = (
        <TransactionsView
          period={filters.period}
          category={filters.category}
          sortBy={filters.sortBy}
          page={filters.page}
          onChange={update}
          onPeriodChange={setPeriod}
        />
      );
      break;
    case 'budgets':
      content = <BudgetsView />;
      break;
    default:
      content = (
        <OverviewView period={filters.period} onPeriodChange={setPeriod} onNavigate={navigate} />
      );
  }

  return (
    <AppShell
      view={view}
      hrefFor={(target) => hrefForView(target, window.location.search)}
      onNavigate={(target) => navigate(target)}
    >
      {/* Keyed per view so the previous view unmounts (rather than being kept hidden)
          while the next one loads; otherwise focus could land on the old heading. */}
      <Suspense key={view} fallback={<ViewSkeleton />}>
        {content}
      </Suspense>
    </AppShell>
  );
}
