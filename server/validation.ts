import { z } from 'zod';
import { CATEGORY_NAMES, findCategoryName } from '../shared/categories';
import { isValidIsoDate } from '../shared/dates';
import {
  DEFAULT_PERIOD,
  DEFAULT_SORT,
  DEFAULT_TRANSACTION_LIMIT,
  DEFAULT_TREND_MONTHS,
  MAX_TRANSACTION_LIMIT,
  MAX_TREND_MONTHS,
  PERIODS,
  SORT_OPTIONS,
} from '../shared/types';

const isoDate = z
  .string()
  .refine(isValidIsoDate, { message: 'Must be a valid calendar date in YYYY-MM-DD format' });

const period = z.enum(PERIODS, {
  errorMap: () => ({ message: `Must be one of: ${PERIODS.join(', ')}` }),
});

/** Integer query parameter with a friendly message for non-numeric input. */
function integerParam(name: string, min: number, max: number, fallback: number) {
  return z
    .string()
    .optional()
    .transform((value, ctx) => {
      if (value === undefined || value === '') return fallback;
      const parsed = Number(value);
      if (!/^\d+$/.test(value) || !Number.isSafeInteger(parsed) || parsed < min || parsed > max) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${name} must be a whole number between ${min} and ${max}`,
        });
        return z.NEVER;
      }
      return parsed;
    });
}

function startNotAfterEnd(
  value: { startDate?: string | undefined; endDate?: string | undefined },
  ctx: z.RefinementCtx,
) {
  if (value.startDate && value.endDate && value.startDate > value.endDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['startDate'],
      message: 'startDate must be on or before endDate',
    });
  }
}

export const customerIdSchema = z
  .string()
  .regex(/^[A-Za-z0-9_-]{1,64}$/, 'customerId may only contain letters, digits, _ and -');

export const summaryQuerySchema = z.object({
  period: period.default(DEFAULT_PERIOD),
});

export const categoriesQuerySchema = z
  .object({
    period: period.default(DEFAULT_PERIOD),
    startDate: isoDate.optional(),
    endDate: isoDate.optional(),
  })
  .superRefine((value, ctx) => {
    if ((value.startDate === undefined) !== (value.endDate === undefined)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [value.startDate === undefined ? 'startDate' : 'endDate'],
        message: 'startDate and endDate must be supplied together',
      });
    }
    startNotAfterEnd(value, ctx);
  });

export const trendsQuerySchema = z.object({
  months: integerParam('months', 1, MAX_TREND_MONTHS, DEFAULT_TREND_MONTHS),
});

export const transactionsQuerySchema = z
  .object({
    limit: integerParam('limit', 1, MAX_TRANSACTION_LIMIT, DEFAULT_TRANSACTION_LIMIT),
    offset: integerParam('offset', 0, Number.MAX_SAFE_INTEGER, 0),
    category: z
      .string()
      .optional()
      .transform((value, ctx) => {
        if (value === undefined || value === '') return undefined;
        const name = findCategoryName(value);
        if (!name) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Must be one of: ${CATEGORY_NAMES.join(', ')}`,
          });
          return z.NEVER;
        }
        return name;
      }),
    startDate: isoDate.optional(),
    endDate: isoDate.optional(),
    /** Documented extension: a preset period as an alternative to explicit dates. */
    period: period.optional(),
    sortBy: z
      .enum(SORT_OPTIONS, {
        errorMap: () => ({ message: `Must be one of: ${SORT_OPTIONS.join(', ')}` }),
      })
      .default(DEFAULT_SORT),
  })
  .superRefine((value, ctx) => {
    if (value.period && (value.startDate || value.endDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['period'],
        message: 'Use either period or startDate/endDate, not both',
      });
    }
    startNotAfterEnd(value, ctx);
  });
