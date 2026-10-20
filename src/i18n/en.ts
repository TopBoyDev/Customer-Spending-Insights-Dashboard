import type { GoalStatus, Period, TransactionSort } from '../../shared/types';
import type { View } from '../navigation';
import { LOCALE } from './locale';

/**
 * English (South Africa) UI copy. Every user-facing string lives here.
 *
 * - Static copy is a string; copy with values is a function, so translations
 *   must accept exactly the same parameters (checked by the compiler).
 * - Numbers, money and dates arrive pre-formatted (see utils/format), keeping
 *   locale formatting in one place.
 * - Plurals use `plural()`, backed by Intl.PluralRules, never `count === 1`.
 */

export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };

const pluralRules = new Intl.PluralRules(LOCALE);

/** Picks the plural form for `count` and substitutes `{count}`. */
export function plural(count: number, forms: PluralForms, formatted = String(count)): string {
  const form = forms[pluralRules.select(count)] ?? forms.other;
  return form.replace('{count}', formatted);
}

export const en = {
  app: {
    name: 'Spending Insights',
    skipToContent: 'Skip to main content',
    sections: 'Dashboard sections',
    colourTheme: 'Colour theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    switchTheme: (mode: 'light' | 'dark') => `Switch to ${mode} mode`,
    dataTo: (date: string) => `Data to ${date}`,
    dataToHelp: 'Demo data is fixed to this date',
    loading: 'Loading',
    loadingApp: 'Loading Spending Insights',
  },

  views: {
    overview: 'Overview',
    categories: 'Categories',
    trends: 'Trends',
    transactions: 'Transactions',
    budgets: 'Budgets',
  } satisfies Record<View, string>,

  period: {
    group: 'Spending period',
    short: { '7d': '7 days', '30d': '30 days', '90d': '90 days', '1y': '1 year' },
    /** Used after "in the …": "last 30 days". */
    last: {
      '7d': 'last 7 days',
      '30d': 'last 30 days',
      '90d': 'last 90 days',
      '1y': 'last year',
    },
    /** Comparison basis: "the previous 30 days". */
    previous: {
      '7d': 'the previous 7 days',
      '30d': 'the previous 30 days',
      '90d': 'the previous 90 days',
      '1y': 'the year before',
    },
  } satisfies {
    group: string;
    short: Record<Period, string>;
    last: Record<Period, string>;
    previous: Record<Period, string>;
  },

  states: {
    sectionFailed: 'This section could not be loaded',
    tryAgainLater: 'Please try again.',
    tryAgain: 'Try again',
    retrying: 'Retrying…',
    networkError: 'We could not reach the server. Check your connection and try again.',
    genericError: 'Something went wrong while loading this information.',
    unexpected:
      'Something unexpected went wrong while showing your spending insights. Reloading the page usually fixes this.',
    reload: 'Reload',
    noSpendingIn: (period: string) => `No spending in the ${period}`,
    tryLongerPeriod: 'Try a longer period to see your spending.',
  },

  change: {
    spending: {
      none: (basis: string) => `No spending in ${basis} to compare with`,
      same: (basis: string) => `The same as ${basis}`,
      more: (percent: string, basis: string) => `${percent} more than ${basis}`,
      less: (percent: string, basis: string) => `${percent} less than ${basis}`,
    },
    count: {
      none: 'Nothing to compare',
      same: 'No change',
      more: (percent: string) => `${percent} more`,
      fewer: (percent: string) => `${percent} fewer`,
    },
    countBadge: (change: string, basis: string) => `${change} transactions than ${basis}`,
  },

  summary: {
    region: 'Spending summary',
    loading: 'Loading spending summary',
    error: 'Your spending summary could not be loaded',
    totalSpent: (period: string) => `Total spent · ${period}`,
    transactions: 'Transactions',
    vsPrior: 'vs prior period',
    averageTransaction: 'Avg. transaction',
    topCategory: 'Top category',
    none: 'None',
    shareOfSpend: (percent: string) => `${percent} of spend`,
  },

  categories: {
    title: 'Categories',
    loading: 'Loading spending by category',
    error: 'Category spending could not be loaded',
    emptyHint: 'Categories appear here once you have transactions in this period.',
    share: 'Share of spending',
    breakdown: 'Breakdown',
    totalSpent: 'Total spent',
    ofTotal: (percent: string) => `${percent} of total`,
    chartSummary: (parts: string) => `Donut chart of spending by category: ${parts}.`,
    rowLabel: (name: string, amount: string, percent: string, transactions: string) =>
      `${name}: ${amount}, ${percent} of spending, ${transactions}. Show these transactions`,
    viewAll: 'categories',
  },

  transactions: {
    title: 'Transactions',
    recent: 'Recent transactions',
    recentLoading: 'Loading recent transactions',
    recentError: 'Recent transactions could not be loaded',
    countInPeriod: (count: string, period: string) => `${count} in the ${period}`,
    count: (count: number, formatted: string) =>
      plural(count, { one: '{count} transaction', other: '{count} transactions' }, formatted),
    list: 'Transaction list',
    loading: 'Loading transactions',
    loadingMore: 'Loading more transactions',
    error: 'Your transactions could not be loaded',
    showing: (first: string, last: string, total: string) =>
      `Showing ${first}–${last} of ${total} transactions`,
    emptyPage: 'No transactions on this page',
    emptyAll: (period: string) => `No transactions in the ${period}`,
    emptyCategory: (category: string, period: string) =>
      `No ${category} transactions in the ${period}`,
    hintFiltered: 'Try clearing the filters or choosing a longer period.',
    hintPeriod: 'Try choosing a longer period.',
    clearFilters: 'Clear filters',
    caption: (period: string, category: string | null, sort: string) =>
      `Transactions in the ${period}${category ? `, ${category} only` : ''}, ${sort}`,
    category: 'Category',
    allCategories: 'All categories',
    sortBy: 'Sort by',
    sort: {
      date_desc: 'Newest first',
      date_asc: 'Oldest first',
      amount_desc: 'Highest amount',
      amount_asc: 'Lowest amount',
    } satisfies Record<TransactionSort, string>,
    columns: {
      date: 'Date',
      merchant: 'Merchant',
      category: 'Category',
      paymentMethod: 'Payment method',
      amount: 'Amount',
    },
    pages: 'Transaction pages',
    page: (page: number, selected: boolean) =>
      `${selected ? 'Current page, ' : 'Go to '}page ${page}`,
    previousPage: 'Previous page',
    nextPage: 'Next page',
    otherPage: (type: string) => `Go to ${type} page`,
    viewAll: 'transactions',
  },

  trends: {
    title: 'Trends',
    snapshotTitle: 'Monthly spending',
    lastMonths: (months: number) => `Last ${months} months`,
    monthsToShow: 'Months to show',
    monthsOption: (months: number) => `${months} months`,
    loading: 'Loading monthly spending trend',
    snapshotLoading: 'Loading monthly spending',
    error: 'Your spending trend could not be loaded',
    snapshotError: 'Monthly spending could not be loaded',
    empty: 'No spending in these months',
    monthlyAverage: 'Monthly average',
    overCompleteMonths: (count: number) =>
      plural(count, { one: 'Over {count} complete month', other: 'Over {count} complete months' }),
    highestMonth: 'Highest month',
    lowestMonth: 'Lowest month',
    monthToDate: (month: string) => `${month} is month to date`,
    toDate: ' (to date)',
    average: 'Average',
    tooltipDetail: (transactions: string, average: string) =>
      `${transactions} transactions · avg ${average}`,
    showTable: 'Show data table',
    hideTable: 'Hide data table',
    tableCaption: 'Monthly spending, oldest first',
    columns: { month: 'Month', spent: 'Spent', transactions: 'Transactions', average: 'Average' },
    insight: {
      notEnough: 'There is not enough complete-month spending yet to show a trend.',
      average: (amount: string, months: number) =>
        plural(months, {
          one: `You spent an average of ${amount} per month over {count} complete month.`,
          other: `You spent an average of ${amount} per month over {count} complete months.`,
        }),
      range: (highMonth: string, high: string, lowMonth: string, low: string) =>
        `Your highest month was ${highMonth} (${high}) and your lowest was ${lowMonth} (${low}).`,
      inLine: (latest: string, before: string) => `${latest} was in line with ${before}.`,
      higher: (latest: string, percent: string, before: string) =>
        `${latest} was ${percent} higher than ${before}.`,
      lower: (latest: string, percent: string, before: string) =>
        `${latest} was ${percent} lower than ${before}.`,
    },
    viewAll: 'trends',
  },

  budgets: {
    title: 'Budgets',
    snapshotTitle: 'Monthly budgets',
    thisMonth: 'This month',
    daysLeft: (days: number) =>
      plural(days, { one: '{count} day left', other: '{count} days left' }),
    monthWithDays: (month: string, daysLeft: string) => `${month} · ${daysLeft}`,
    loading: 'Loading monthly budgets',
    error: 'Your budgets could not be loaded',
    empty: 'No monthly budgets set',
    totalBudgeted: 'Total budgeted',
    spentSoFar: 'Spent so far',
    remaining: 'Remaining',
    overBudget: 'Over budget',
    categoryCount: (count: number) =>
      plural(count, { one: '{count} category', other: '{count} categories' }),
    ofBudget: (percent: string) => `${percent} of budget`,
    monthlyBudget: (amount: string) => `Monthly budget ${amount}`,
    spentOf: (spent: string, budget: string) => `${spent} of ${budget}`,
    budgetUsed: (category: string) => `${category} budget used`,
    usedOf: (percent: string, budget: string) => `${percent} of ${budget} used`,
    overBy: (amount: string) => `${amount} over budget`,
    left: (amount: string) => `${amount} left`,
    leftPerDay: (amount: string, perDay: string) => `${amount} left · about ${perDay} a day`,
    status: {
      on_track: 'On track',
      warning: 'Nearing limit',
      exceeded: 'Over budget',
    } satisfies Record<GoalStatus, string>,
    statusHelp: {
      on_track: 'Less than 80% of the monthly budget used',
      warning: '80% to 100% of the monthly budget used',
      exceeded: 'More than the monthly budget has been spent',
    } satisfies Record<GoalStatus, string>,
    viewAll: 'budgets',
  },

  common: {
    viewAll: 'View all',
    viewAllLabel: (destination: string) => `View all ${destination}`,
  },
};

/** The shape every locale must implement. */
export type Messages = typeof en;
