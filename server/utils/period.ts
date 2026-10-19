import { addDays, diffInDays } from '../../shared/dates';
import type { DateRange, Period } from '../../shared/types';

export const PERIOD_DAYS: Readonly<Record<Period, number>> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '1y': 365,
};

/** The `period` days ending on (and including) the reference date. */
export function resolvePeriod(period: Period, referenceDate: string): DateRange {
  return {
    startDate: addDays(referenceDate, -(PERIOD_DAYS[period] - 1)),
    endDate: referenceDate,
  };
}

/** Inclusive number of calendar days in a range. */
export function rangeLength(range: DateRange): number {
  return diffInDays(range.startDate, range.endDate) + 1;
}

/** The range of equal length immediately before `range`. */
export function previousRange(range: DateRange): DateRange {
  const length = rangeLength(range);
  return {
    startDate: addDays(range.startDate, -length),
    endDate: addDays(range.startDate, -1),
  };
}
