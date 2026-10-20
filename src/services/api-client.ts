import { en } from '../i18n/en';
import type {
  ApiErrorBody,
  ApiMeta,
  CategoryName,
  CustomerProfile,
  FiltersResponse,
  PaginatedTransactions,
  Period,
  SpendingByCategory,
  SpendingGoals,
  SpendingSummary,
  SpendingTrends,
  TransactionSort,
} from '../../shared/types';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** 4xx responses will not succeed on retry. */
  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }
}

type QueryValue = string | number | undefined | null;

function buildUrl(path: string, params: Record<string, QueryValue> = {}): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  }
  const query = search.toString();
  return `/api${path}${query ? `?${query}` : ''}`;
}

async function request<T>(
  path: string,
  params: Record<string, QueryValue>,
  signal?: AbortSignal,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(buildUrl(path, params), {
      signal,
      headers: { Accept: 'application/json' },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError(0, en.states.networkError);
  }

  if (!response.ok) {
    let message = en.states.genericError;
    let code: string | undefined;
    try {
      const body = (await response.json()) as Partial<ApiErrorBody>;
      if (body.error?.message) message = body.error.message;
      code = body.error?.code;
    } catch {
      // Non-JSON error body (e.g. a proxy error page); keep the generic message.
    }
    throw new ApiError(response.status, message, code);
  }

  return (await response.json()) as T;
}

export interface TransactionParams {
  limit: number;
  offset: number;
  sortBy: TransactionSort;
  category?: CategoryName | null;
  period?: Period;
  startDate?: string;
  endDate?: string;
}

const customerPath = (customerId: string) => `/customers/${encodeURIComponent(customerId)}`;

export const apiClient = {
  getMeta: (signal?: AbortSignal) => request<ApiMeta>('/meta', {}, signal),

  getProfile: (customerId: string, signal?: AbortSignal) =>
    request<CustomerProfile>(`${customerPath(customerId)}/profile`, {}, signal),

  getSummary: (customerId: string, period: Period, signal?: AbortSignal) =>
    request<SpendingSummary>(`${customerPath(customerId)}/spending/summary`, { period }, signal),

  getCategories: (customerId: string, period: Period, signal?: AbortSignal) =>
    request<SpendingByCategory>(
      `${customerPath(customerId)}/spending/categories`,
      { period },
      signal,
    ),

  getTrends: (customerId: string, months: number, signal?: AbortSignal) =>
    request<SpendingTrends>(`${customerPath(customerId)}/spending/trends`, { months }, signal),

  getTransactions: (customerId: string, params: TransactionParams, signal?: AbortSignal) =>
    request<PaginatedTransactions>(
      `${customerPath(customerId)}/transactions`,
      { ...params },
      signal,
    ),

  getGoals: (customerId: string, signal?: AbortSignal) =>
    request<SpendingGoals>(`${customerPath(customerId)}/goals`, {}, signal),

  getFilters: (customerId: string, signal?: AbortSignal) =>
    request<FiltersResponse>(`${customerPath(customerId)}/filters`, {}, signal),
};
