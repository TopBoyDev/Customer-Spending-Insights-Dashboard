import { useCallback, useEffect, useRef } from 'react';
import type { CategoryName } from '../shared/categories';
import { AppShell } from './components/layout/AppShell';
import { PAGE_HEADING_ID } from './components/layout/PageHeader';
import { hrefForView, useDashboardFilters } from './hooks/useDashboardFilters';
import { VIEW_LABEL, type View } from './navigation';
import { BudgetsView } from './views/BudgetsView';
import { CategoriesView } from './views/CategoriesView';
import { OverviewView } from './views/OverviewView';
import { TransactionsView } from './views/TransactionsView';
import { TrendsView } from './views/TrendsView';

export function App() {
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
    document.title = `${VIEW_LABEL[view]} · Spending Insights`;
    if (previousView.current === view) return;
    previousView.current = view;
    window.scrollTo({ top: 0 });
    document.getElementById(PAGE_HEADING_ID)?.focus({ preventScroll: true });
  }, [view]);

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
      {content}
    </AppShell>
  );
}
