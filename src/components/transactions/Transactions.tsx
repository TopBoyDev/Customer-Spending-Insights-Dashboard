import {
  Box,
  Button,
  Chip,
  LinearProgress,
  Pagination,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect } from 'react';
import type { CategoryName } from '../../../shared/categories';
import { DEFAULT_SORT, type Period, type TransactionSort } from '../../../shared/types';
import { TRANSACTIONS_PAGE_SIZE } from '../../config';
import { useTransactions } from '../../hooks/useInsightsQueries';
import { formatNumber, PERIOD_LABEL, SORT_LABELS } from '../../utils/format';
import { SectionCard } from '../common/SectionCard';
import { EmptyState, SectionState } from '../states/SectionState';
import { TransactionFilters } from './TransactionFilters';
import { TransactionList } from './TransactionList';
import { TransactionTable } from './TransactionTable';

interface TransactionsProps {
  period: Period;
  category: CategoryName | null;
  sortBy: TransactionSort;
  page: number;
  onChange: (changes: {
    category?: CategoryName | null;
    sortBy?: TransactionSort;
    page?: number;
  }) => void;
}

export const TRANSACTIONS_SECTION_ID = 'transactions';

export function Transactions({ period, category, sortBy, page, onChange }: TransactionsProps) {
  const theme = useTheme();
  const isWide = useMediaQuery(theme.breakpoints.up('md'));
  const query = useTransactions({
    period,
    category,
    sortBy,
    limit: TRANSACTIONS_PAGE_SIZE,
    offset: (page - 1) * TRANSACTIONS_PAGE_SIZE,
  });

  const total = query.data?.pagination.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / TRANSACTIONS_PAGE_SIZE));

  // A shared or stale URL may point beyond the last page; move to the last real page.
  useEffect(() => {
    if (!query.isPlaceholderData && query.data && total > 0 && page > pageCount) {
      onChange({ page: pageCount });
    }
  }, [query.isPlaceholderData, query.data, total, page, pageCount, onChange]);

  const hasFilters = category !== null || sortBy !== DEFAULT_SORT;
  const clearFilters = () => onChange({ category: null, sortBy: DEFAULT_SORT });

  return (
    <SectionCard
      id={TRANSACTIONS_SECTION_ID}
      title="Transactions"
      subtitle={`Your spending in the ${PERIOD_LABEL[period]}`}
      action={
        <TransactionFilters
          category={category}
          sortBy={sortBy}
          onCategoryChange={(next) => onChange({ category: next })}
          onSortChange={(next) => onChange({ sortBy: next })}
        />
      }
    >
      {category && (
        <Chip
          label={`Category: ${category}`}
          onDelete={() => onChange({ category: null })}
          sx={{ mb: 2 }}
        />
      )}
      <SectionState
        query={query}
        loadingLabel="Loading transactions"
        skeleton={
          <Stack spacing={1}>
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} variant="rounded" height={48} />
            ))}
          </Stack>
        }
        errorTitle="Your transactions could not be loaded"
        isEmpty={(data) => data.pagination.total === 0}
        empty={
          <EmptyState
            title={
              category
                ? `No ${category} transactions in the ${PERIOD_LABEL[period]}`
                : `No transactions in the ${PERIOD_LABEL[period]}`
            }
            description={
              hasFilters
                ? 'Try clearing the filters or choosing a longer period.'
                : 'Try choosing a longer period.'
            }
            action={
              hasFilters && (
                <Button variant="outlined" onClick={clearFilters}>
                  Clear filters
                </Button>
              )
            }
          />
        }
      >
        {(data) => {
          const first = data.pagination.offset + 1;
          const last = data.pagination.offset + data.transactions.length;
          const caption = `Transactions in the ${PERIOD_LABEL[period]}${category ? `, ${category} only` : ''}, ${SORT_LABELS[sortBy].toLowerCase()}`;
          return (
            <Stack spacing={2}>
              <Box sx={{ minHeight: 4 }}>
                {query.isFetching && query.isPlaceholderData && (
                  <LinearProgress aria-label="Loading more transactions" sx={{ height: 4 }} />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary" role="status" aria-live="polite">
                {data.transactions.length > 0
                  ? `Showing ${formatNumber(first)}–${formatNumber(last)} of ${formatNumber(data.pagination.total)} transactions`
                  : `No transactions on this page`}
              </Typography>
              <Box sx={{ opacity: query.isPlaceholderData ? 0.6 : 1, transition: 'opacity 150ms' }}>
                {isWide ? (
                  <TransactionTable transactions={data.transactions} caption={caption} />
                ) : (
                  <TransactionList
                    transactions={data.transactions}
                    groupByDate={sortBy.startsWith('date')}
                  />
                )}
              </Box>
              {pageCount > 1 && (
                <Pagination
                  count={pageCount}
                  page={Math.min(page, pageCount)}
                  onChange={(_event, next) => onChange({ page: next })}
                  color="primary"
                  shape="rounded"
                  siblingCount={isWide ? 1 : 0}
                  boundaryCount={1}
                  getItemAriaLabel={(type, itemPage, selected) => {
                    if (type === 'page')
                      return `${selected ? 'Current page, ' : 'Go to '}page ${itemPage}`;
                    return type === 'previous'
                      ? 'Previous page'
                      : type === 'next'
                        ? 'Next page'
                        : `Go to ${type} page`;
                  }}
                  sx={{ alignSelf: 'center' }}
                  aria-label="Transaction pages"
                />
              )}
            </Stack>
          );
        }}
      </SectionState>
    </SectionCard>
  );
}
