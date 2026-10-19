import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { Period } from '../../shared/types';
import { CUSTOMER_ID } from '../config';
import { apiClient, type TransactionParams } from '../services/api-client';

/** Query keys include every parameter, so responses for different filters never mix. */
export const queryKeys = {
  meta: ['meta'] as const,
  profile: (customerId: string) => ['profile', customerId] as const,
  summary: (customerId: string, period: Period) => ['summary', customerId, period] as const,
  categories: (customerId: string, period: Period) => ['categories', customerId, period] as const,
  trends: (customerId: string, months: number) => ['trends', customerId, months] as const,
  transactions: (customerId: string, params: TransactionParams) =>
    ['transactions', customerId, params] as const,
  goals: (customerId: string) => ['goals', customerId] as const,
  filters: (customerId: string) => ['filters', customerId] as const,
};

export function useApiMeta() {
  return useQuery({
    queryKey: queryKeys.meta,
    queryFn: ({ signal }) => apiClient.getMeta(signal),
    staleTime: Infinity,
  });
}

export function useCustomerProfile(customerId = CUSTOMER_ID) {
  return useQuery({
    queryKey: queryKeys.profile(customerId),
    queryFn: ({ signal }) => apiClient.getProfile(customerId, signal),
  });
}

export function useSpendingSummary(period: Period, customerId = CUSTOMER_ID) {
  return useQuery({
    queryKey: queryKeys.summary(customerId, period),
    queryFn: ({ signal }) => apiClient.getSummary(customerId, period, signal),
  });
}

export function useSpendingCategories(period: Period, customerId = CUSTOMER_ID) {
  return useQuery({
    queryKey: queryKeys.categories(customerId, period),
    queryFn: ({ signal }) => apiClient.getCategories(customerId, period, signal),
  });
}

export function useSpendingTrends(months: number, customerId = CUSTOMER_ID) {
  return useQuery({
    queryKey: queryKeys.trends(customerId, months),
    queryFn: ({ signal }) => apiClient.getTrends(customerId, months, signal),
    placeholderData: keepPreviousData,
  });
}

export function useTransactions(params: TransactionParams, customerId = CUSTOMER_ID) {
  return useQuery({
    queryKey: queryKeys.transactions(customerId, params),
    queryFn: ({ signal }) => apiClient.getTransactions(customerId, params, signal),
    // Keep the current page visible while the next page loads, instead of flashing a skeleton.
    placeholderData: keepPreviousData,
  });
}

export function useSpendingGoals(customerId = CUSTOMER_ID) {
  return useQuery({
    queryKey: queryKeys.goals(customerId),
    queryFn: ({ signal }) => apiClient.getGoals(customerId, signal),
  });
}

export function useFilterOptions(customerId = CUSTOMER_ID) {
  return useQuery({
    queryKey: queryKeys.filters(customerId),
    queryFn: ({ signal }) => apiClient.getFilters(customerId, signal),
    staleTime: Infinity,
  });
}
