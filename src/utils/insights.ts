import type { MonthlyTrend, Period } from '../../shared/types';
import { formatCurrency, formatMonthLong, formatPercent, PREVIOUS_PERIOD_LABEL } from './format';

export type ChangeDirection = 'up' | 'down' | 'flat' | 'none';

export interface ChangeDescription {
  direction: ChangeDirection;
  /** Plain-language sentence, e.g. "12,5% more than the previous 30 days". */
  text: string;
}

/**
 * Neutral wording for a period-over-period change. Spending more is not
 * automatically bad, so the copy avoids judgement words.
 */
export function describeSpendingChange(change: number | null, period: Period): ChangeDescription {
  const basis = PREVIOUS_PERIOD_LABEL[period];
  if (change === null) {
    return { direction: 'none', text: `No spending in ${basis} to compare with` };
  }
  if (change === 0) return { direction: 'flat', text: `The same as ${basis}` };
  const amount = formatPercent(Math.abs(change));
  return change > 0
    ? { direction: 'up', text: `${amount} more than ${basis}` }
    : { direction: 'down', text: `${amount} less than ${basis}` };
}

/**
 * Compact wording for secondary metrics. The comparison basis is already
 * spelled out once next to the headline total, so it is not repeated here.
 */
export function describeCountChange(change: number | null): ChangeDescription {
  if (change === null) return { direction: 'none', text: 'Nothing to compare' };
  if (change === 0) return { direction: 'flat', text: 'No change' };
  const amount = formatPercent(Math.abs(change));
  return change > 0
    ? { direction: 'up', text: `${amount} more` }
    : { direction: 'down', text: `${amount} fewer` };
}

export interface TrendInsight {
  /** Months considered complete (excludes a month still in progress). */
  completeMonths: MonthlyTrend[];
  averageMonthly: number | null;
  highest: MonthlyTrend | null;
  lowest: MonthlyTrend | null;
  sentences: string[];
}

/**
 * Text takeaways for the monthly trend so the insight never depends on
 * reading the chart or hovering a tooltip.
 */
export function summariseTrends(
  trends: readonly MonthlyTrend[],
  currentMonth: string | undefined,
): TrendInsight {
  const completeMonths = trends.filter((trend) => trend.month !== currentMonth);
  const withSpending = completeMonths.filter((trend) => trend.transactionCount > 0);

  if (withSpending.length === 0) {
    return {
      completeMonths,
      averageMonthly: null,
      highest: null,
      lowest: null,
      sentences: ['There is not enough complete-month spending yet to show a trend.'],
    };
  }

  const total = withSpending.reduce((sum, trend) => sum + trend.totalSpent, 0);
  const averageMonthly = total / withSpending.length;
  const highest = withSpending.reduce((max, trend) =>
    trend.totalSpent > max.totalSpent ? trend : max,
  );
  const lowest = withSpending.reduce((min, trend) =>
    trend.totalSpent < min.totalSpent ? trend : min,
  );

  const sentences = [
    `You spent an average of ${formatCurrency(averageMonthly)} per month over ${withSpending.length} complete ${withSpending.length === 1 ? 'month' : 'months'}.`,
  ];
  if (withSpending.length > 1) {
    sentences.push(
      `Your highest month was ${formatMonthLong(highest.month)} (${formatCurrency(highest.totalSpent)}) and your lowest was ${formatMonthLong(lowest.month)} (${formatCurrency(lowest.totalSpent)}).`,
    );
  }

  const latest = completeMonths.at(-1);
  const beforeLatest = completeMonths.at(-2);
  if (latest && beforeLatest && beforeLatest.totalSpent > 0) {
    const change = ((latest.totalSpent - beforeLatest.totalSpent) / beforeLatest.totalSpent) * 100;
    const rounded = Math.round(change * 10) / 10;
    sentences.push(
      rounded === 0
        ? `${formatMonthLong(latest.month)} was in line with ${formatMonthLong(beforeLatest.month)}.`
        : `${formatMonthLong(latest.month)} was ${formatPercent(Math.abs(rounded))} ${rounded > 0 ? 'higher' : 'lower'} than ${formatMonthLong(beforeLatest.month)}.`,
    );
  }

  return { completeMonths, averageMonthly, highest, lowest, sentences };
}
