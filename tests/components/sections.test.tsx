// @vitest-environment jsdom
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../src/App';
import { PeriodSelector } from '../../src/components/dashboard/PeriodSelector';
import { CategorySnapshot } from '../../src/components/overview/CategorySnapshot';
import { SummaryCard } from '../../src/components/overview/SummaryCard';
import { GoalCard } from '../../src/views/BudgetsView';
import { CategoriesView } from '../../src/views/CategoriesView';
import { TransactionsPanel } from '../../src/views/TransactionsView';
import { jsonResponse, money, renderWithProviders, setupMockApi } from './test-utils';

const api = setupMockApi();
beforeEach(() => api.install());

describe('SummaryCard', () => {
  it('shows a loading state, then the headline total and comparison', async () => {
    renderWithProviders(<SummaryCard period="30d" />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading spending summary');

    expect(await screen.findByText(money('R 19 004,60'))).toBeInTheDocument();
    expect(screen.getByText(/Total spent · last 30 days/)).toBeInTheDocument();
    expect(screen.getByText('3,8% more than the previous 30 days')).toBeInTheDocument();
    expect(screen.getByText('Transportation')).toBeInTheDocument();
  });

  it('shows an error with a retry that issues a new request', async () => {
    let fail = true;
    api.override((url) =>
      fail && url.pathname.endsWith('/spending/summary')
        ? jsonResponse({ error: { code: 'INTERNAL_ERROR', message: 'Service unavailable' } }, 503)
        : undefined,
    );
    renderWithProviders(<SummaryCard period="7d" />);

    expect(
      await screen.findByText('Your spending summary could not be loaded'),
    ).toBeInTheDocument();
    expect(screen.getByText('Service unavailable')).toBeInTheDocument();

    const before = api.requests.filter((url) => url.pathname.endsWith('/summary')).length;
    fail = false;
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText(money('R 3 940,31'))).toBeInTheDocument();
    expect(api.requests.filter((url) => url.pathname.endsWith('/summary')).length).toBe(before + 1);
  });

  it('shows an empty state when there is no spending', async () => {
    api.override((url) =>
      url.pathname.endsWith('/spending/summary')
        ? jsonResponse({
            period: '7d',
            totalSpent: 0,
            transactionCount: 0,
            averageTransaction: 0,
            topCategory: null,
            comparedToPrevious: { spentChange: null, transactionChange: null },
          })
        : undefined,
    );
    renderWithProviders(<SummaryCard period="7d" />);
    expect(await screen.findByText('No spending in the last 7 days')).toBeInTheDocument();
  });
});

describe('PeriodSelector', () => {
  it('exposes the selected period and reports changes', async () => {
    const onChange = vi.fn();
    renderWithProviders(<PeriodSelector value="30d" onChange={onChange} />);

    const group = screen.getByRole('group', { name: 'Spending period' });
    expect(within(group).getByRole('button', { name: '30 days' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await userEvent.click(within(group).getByRole('button', { name: '7 days' }));
    expect(onChange).toHaveBeenCalledWith('7d');

    // Re-selecting the active option must not clear the period.
    await userEvent.click(within(group).getByRole('button', { name: '30 days' }));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

describe('CategoriesView', () => {
  it('lists every category with an accessible chart summary and selectable rows', async () => {
    const onSelect = vi.fn();
    renderWithProviders(
      <CategoriesView period="30d" onPeriodChange={vi.fn()} onSelectCategory={onSelect} />,
    );

    const breakdown = await screen.findByRole('region', { name: 'Breakdown' });
    const rows = within(breakdown).getAllByRole('button');
    expect(rows).toHaveLength(6);
    expect(rows[0]).toHaveAccessibleName(
      /^Transportation: R\s5\s268,35, 27,7% of spending, 10 transactions/,
    );
    expect(
      await screen.findByRole('img', { name: /Donut chart of spending by category/ }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/20 Sept? 2026 – 19 Oct 2026/).length).toBeGreaterThan(0);

    await userEvent.click(rows[1]!);
    expect(onSelect).toHaveBeenCalledWith('Groceries');
  });
});

describe('TransactionsPanel', () => {
  it('has labelled filter controls and reports filter changes', async () => {
    const onChange = vi.fn();
    renderWithProviders(
      <TransactionsPanel
        period="30d"
        category={null}
        sortBy="date_desc"
        page={1}
        onChange={onChange}
      />,
    );

    expect(await screen.findByText('Showing 1–10 of 45 transactions')).toBeInTheDocument();
    // One debit amount per transaction row/card on the page.
    expect(screen.getAllByText(/^−R/)).toHaveLength(10);

    await userEvent.click(screen.getByRole('combobox', { name: /^Sort by/ }));
    await userEvent.click(await screen.findByRole('option', { name: 'Highest amount' }));
    expect(onChange).toHaveBeenCalledWith({ sortBy: 'amount_desc' });

    await userEvent.click(screen.getByRole('combobox', { name: /^Category/ }));
    await userEvent.click(await screen.findByRole('option', { name: 'Dining' }));
    expect(onChange).toHaveBeenCalledWith({ category: 'Dining' });

    await userEvent.click(screen.getByRole('button', { name: 'Go to page 2' }));
    expect(onChange).toHaveBeenCalledWith({ page: 2 });
  });

  it('requests the selected filters from the API', async () => {
    renderWithProviders(
      <TransactionsPanel
        period="90d"
        category="Groceries"
        sortBy="amount_asc"
        page={2}
        onChange={vi.fn()}
      />,
    );
    await screen.findByText(/^Showing 11–/);
    const request = api.requests.find((url) => url.pathname.endsWith('/transactions'));
    expect(Object.fromEntries(request!.searchParams)).toEqual({
      period: '90d',
      category: 'Groceries',
      sortBy: 'amount_asc',
      limit: '10',
      offset: '10',
    });
  });

  it('offers to clear filters when nothing matches', async () => {
    api.override((url) =>
      url.pathname.endsWith('/transactions')
        ? jsonResponse({
            transactions: [],
            pagination: { total: 0, limit: 10, offset: 0, hasMore: false },
          })
        : undefined,
    );
    const onChange = vi.fn();
    renderWithProviders(
      <TransactionsPanel
        period="7d"
        category="Utilities"
        sortBy="date_desc"
        page={1}
        onChange={onChange}
      />,
    );

    expect(
      await screen.findByText('No Utilities transactions in the last 7 days'),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(onChange).toHaveBeenCalledWith({ category: null, sortBy: 'date_desc' });
  });
});

describe('GoalCard', () => {
  it('states the status in text and exposes progress accessibly', () => {
    renderWithProviders(
      <GoalCard
        goal={{
          id: 'g',
          category: 'Transportation',
          monthlyBudget: 3500,
          currentSpent: 3794.86,
          percentageUsed: 108.42,
          daysRemaining: 12,
          status: 'exceeded',
        }}
      />,
    );
    expect(screen.getByText('Over budget')).toBeInTheDocument();
    expect(screen.getByText(money('R 294,86 over budget'))).toBeInTheDocument();
    const progress = screen.getByRole('progressbar', { name: 'Transportation budget used' });
    expect(progress).toHaveAttribute('aria-valuenow', '100');
    expect(progress.getAttribute('aria-valuetext')).toMatch(/^108,4% of R\s3\s500,00 used$/);
  });

  it('suggests a daily allowance for the rest of the month', () => {
    renderWithProviders(
      <GoalCard
        goal={{
          id: 'g',
          category: 'Dining',
          monthlyBudget: 2000,
          currentSpent: 1400,
          percentageUsed: 70,
          daysRemaining: 12,
          status: 'on_track',
        }}
      />,
    );
    expect(screen.getByText(money('R 600,00 left · about R 50,00 a day'))).toBeInTheDocument();
  });
});

describe('error isolation', () => {
  it('keeps other cards working when one endpoint fails', async () => {
    api.override((url) =>
      url.pathname.endsWith('/spending/categories')
        ? jsonResponse({ error: { code: 'INTERNAL_ERROR', message: 'Down' } }, 500)
        : undefined,
    );
    renderWithProviders(
      <>
        <SummaryCard period="30d" />
        <CategorySnapshot period="30d" onMore={vi.fn()} />
      </>,
    );
    await waitFor(() =>
      expect(screen.getByText('Category spending could not be loaded')).toBeInTheDocument(),
    );
    expect(await screen.findByText(money('R 19 004,60'))).toBeInTheDocument();
  });
});

describe('App navigation', () => {
  it('switches tabs, updates the URL and title, and moves focus to the new heading', async () => {
    renderWithProviders(<App />);
    expect(await screen.findByRole('heading', { level: 1, name: 'Overview' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'View all budgets' }));

    const heading = await screen.findByRole('heading', { level: 1, name: 'Budgets' });
    expect(window.location.search).toBe('?view=budgets');
    expect(document.title).toBe('Budgets · Spending Insights');
    await waitFor(() => expect(heading).toHaveFocus());
  });

  it('opens the transactions tab filtered to a category chosen on the categories tab', async () => {
    window.history.replaceState(null, '', '/?view=categories&period=90d');
    renderWithProviders(<App />);

    const breakdown = await screen.findByRole('region', { name: 'Breakdown' });
    await userEvent.click(await within(breakdown).findByRole('button', { name: /^Dining:/ }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Transactions' }),
    ).toBeInTheDocument();
    expect(window.location.search).toBe('?view=transactions&period=90d&category=Dining');
    expect(await screen.findByRole('combobox', { name: /^Category/ })).toHaveTextContent('Dining');
  });
});
