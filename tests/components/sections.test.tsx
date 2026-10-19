// @vitest-environment jsdom
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PeriodSelector } from '../../src/components/dashboard/PeriodSelector';
import { GoalCard } from '../../src/components/goals/SpendingGoals';
import { CategoryBreakdown } from '../../src/components/spending/CategoryBreakdown';
import { SpendingSummary } from '../../src/components/spending/SpendingSummary';
import { Transactions } from '../../src/components/transactions/Transactions';
import { jsonResponse, money, renderWithProviders, setupMockApi } from './test-utils';

const api = setupMockApi();
beforeEach(() => api.install());

describe('SpendingSummary', () => {
  it('shows a loading state, then the headline total and comparison', async () => {
    renderWithProviders(<SpendingSummary period="30d" />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading spending summary');

    expect(await screen.findByText(money('R 19 004,60'))).toBeInTheDocument();
    expect(screen.getByText('in the last 30 days')).toBeInTheDocument();
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
    renderWithProviders(<SpendingSummary period="7d" />);

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
    renderWithProviders(<SpendingSummary period="7d" />);
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

describe('CategoryBreakdown', () => {
  it('lists every category with amounts that add up to the chart total', async () => {
    const onSelect = vi.fn();
    renderWithProviders(<CategoryBreakdown period="30d" onSelectCategory={onSelect} />);

    const list = await screen.findByRole('list');
    const rows = within(list).getAllByRole('button');
    expect(rows).toHaveLength(6);
    expect(rows[0]).toHaveAccessibleName(
      /^Transportation: R\sR?5\s268,35, 27,7% of spending, 10 transactions/,
    );

    expect(
      screen.getByRole('img', { name: /Donut chart of spending by category/ }),
    ).toBeInTheDocument();
    expect(screen.getByText(/20 Sept? 2026 – 19 Oct 2026/)).toBeInTheDocument();

    await userEvent.click(rows[1]!);
    expect(onSelect).toHaveBeenCalledWith('Groceries');
  });
});

describe('Transactions', () => {
  it('has labelled filter controls and reports filter changes', async () => {
    const onChange = vi.fn();
    renderWithProviders(
      <Transactions period="30d" category={null} sortBy="date_desc" page={1} onChange={onChange} />,
    );

    expect(await screen.findByText('Showing 1–10 of 45 transactions')).toBeInTheDocument();
    // One debit amount per transaction row/card on the page.
    expect(screen.getAllByText(/^−R/)).toHaveLength(10);

    await userEvent.click(screen.getByRole('combobox', { name: 'Sort by' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Highest amount' }));
    expect(onChange).toHaveBeenCalledWith({ sortBy: 'amount_desc' });

    await userEvent.click(screen.getByRole('combobox', { name: 'Category' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Dining' }));
    expect(onChange).toHaveBeenCalledWith({ category: 'Dining' });

    await userEvent.click(screen.getByRole('button', { name: 'Go to page 2' }));
    expect(onChange).toHaveBeenCalledWith({ page: 2 });
  });

  it('requests the selected filters from the API', async () => {
    renderWithProviders(
      <Transactions
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
      <Transactions
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
      <ul>
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
        />
      </ul>,
    );
    expect(screen.getByText('Over budget')).toBeInTheDocument();
    expect(screen.getByText(money('R 294,86 over'))).toBeInTheDocument();
    const progress = screen.getByRole('progressbar', { name: 'Transportation budget used' });
    expect(progress).toHaveAttribute('aria-valuenow', '100');
    expect(progress.getAttribute('aria-valuetext')).toMatch(/^108,4% of R\s3\s500,00 used$/);
  });
});

describe('error isolation', () => {
  it('keeps other sections working when one endpoint fails', async () => {
    api.override((url) =>
      url.pathname.endsWith('/spending/categories')
        ? jsonResponse({ error: { code: 'INTERNAL_ERROR', message: 'Down' } }, 500)
        : undefined,
    );
    renderWithProviders(
      <>
        <SpendingSummary period="30d" />
        <CategoryBreakdown period="30d" onSelectCategory={vi.fn()} />
      </>,
    );
    await waitFor(() =>
      expect(screen.getByText('Category spending could not be loaded')).toBeInTheDocument(),
    );
    expect(await screen.findByText(money('R 19 004,60'))).toBeInTheDocument();
  });
});
