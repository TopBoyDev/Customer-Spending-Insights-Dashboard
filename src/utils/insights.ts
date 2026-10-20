import type { MonthlyTrend, Period } from '../../shared/types';
import { en, type Messages } from '../i18n/en';
import { formatCurrency, formatMonthLong, formatPercent } from './format';

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
export function describeSpendingChange(
  change: number | null,
  period: Period,
  m: Messages = en,
): ChangeDescription {
  const basis = m.period.previous[period];
  const copy = m.change.spending;
  if (change === null) return { direction: 'none', text: copy.none(basis) };
  if (change === 0) return { direction: 'flat', text: copy.same(basis) };
  const amount = formatPercent(Math.abs(change));
  return change > 0
    ? { direction: 'up', text: copy.more(amount, basis) }
    : { direction: 'down', text: copy.less(amount, basis) };
}

/**
 * Compact wording for secondary metrics. The comparison basis is already
 * spelled out once next to the headline total, so it is not repeated here.
 */
export function describeCountChange(change: number | null, m: Messages = en): ChangeDescription {
  const copy = m.change.count;
  if (change === null) return { direction: 'none', text: copy.none };
  if (change === 0) return { direction: 'flat', text: copy.same };
  const amount = formatPercent(Math.abs(change));
  return change > 0
    ? { direction: 'up', text: copy.more(amount) }
    : { direction: 'down', text: copy.fewer(amount) };
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
  m: Messages = en,
): TrendInsight {
  const copy = m.trends.insight;
  const completeMonths = trends.filter((trend) => trend.month !== currentMonth);
  const withSpending = completeMonths.filter((trend) => trend.transactionCount > 0);

  if (withSpending.length === 0) {
    return {
      completeMonths,
      averageMonthly: null,
      highest: null,
      lowest: null,
      sentences: [copy.notEnough],
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

  const sentences = [copy.average(formatCurrency(averageMonthly), withSpending.length)];
  if (withSpending.length > 1) {
    sentences.push(
      copy.range(
        formatMonthLong(highest.month),
        formatCurrency(highest.totalSpent),
        formatMonthLong(lowest.month),
        formatCurrency(lowest.totalSpent),
      ),
    );
  }

  const latest = completeMonths.at(-1);
  const beforeLatest = completeMonths.at(-2);
  if (latest && beforeLatest && beforeLatest.totalSpent > 0) {
    const change = ((latest.totalSpent - beforeLatest.totalSpent) / beforeLatest.totalSpent) * 100;
    const rounded = Math.round(change * 10) / 10;
    const latestLabel = formatMonthLong(latest.month);
    const beforeLabel = formatMonthLong(beforeLatest.month);
    const percent = formatPercent(Math.abs(rounded));
    sentences.push(
      rounded === 0
        ? copy.inLine(latestLabel, beforeLabel)
        : rounded > 0
          ? copy.higher(latestLabel, percent, beforeLabel)
          : copy.lower(latestLabel, percent, beforeLabel),
    );
  }

  return { completeMonths, averageMonthly, highest, lowest, sentences };
}
