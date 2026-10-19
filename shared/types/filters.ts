import type { CategoryMeta } from '../categories';
import type { Period } from './spending';

export interface DateRangePreset {
  label: string;
  value: Period;
}

/** GET /api/customers/{customerId}/filters */
export interface FiltersResponse {
  categories: CategoryMeta[];
  dateRangePresets: DateRangePreset[];
}

/** GET /api/meta (non-contract helper endpoint, see README) */
export interface ApiMeta {
  /** Last calendar date covered by the demo data, YYYY-MM-DD. */
  dataAsOf: string;
  timezone: string;
  currency: 'ZAR';
}

/** Error body returned by every failing API request. */
export interface ApiErrorBody {
  error: {
    code: 'BAD_REQUEST' | 'NOT_FOUND' | 'INTERNAL_ERROR';
    message: string;
    details?: { field: string; message: string }[];
  };
}
