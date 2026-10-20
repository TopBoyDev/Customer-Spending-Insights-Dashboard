import {
  Box,
  Button,
  Card,
  Chip,
  LinearProgress,
  Pagination,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
  type Theme,
} from '@mui/material';
import { useEffect } from 'react';
import type { CategoryName } from '../../shared/categories';
import { DEFAULT_SORT, type Period, type TransactionSort } from '../../shared/types';
import { PeriodSelector } from '../components/dashboard/PeriodSelector';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState, SectionState } from '../components/states/SectionState';
import { TransactionFilters } from '../components/transactions/TransactionFilters';
import { TransactionList } from '../components/transactions/TransactionList';
import { TransactionTable } from '../components/transactions/TransactionTable';
import { TRANSACTIONS_PAGE_SIZE } from '../config';
import { useTransactions } from '../hooks/useInsightsQueries';
import { formatNumber, PERIOD_LABEL, SORT_LABELS } from '../utils/format';

export interface TransactionFilterChanges {
  category?: CategoryName | null;
  sortBy?: TransactionSort;
  page?: number;
}

interface TransactionsPanelProps {
  period: Period;
  category: CategoryName | null;
  sortBy: TransactionSort;
  page: number;
  onChange: (changes: TransactionFilterChanges) => void;
}

/** Filterable, sortable, paginated transaction list for the selected period. */
export function TransactionsPanel({
  period,
  category,
  sortBy,
  page,
  onChange,
}: TransactionsPanelProps) {
  const isWide = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
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
    <Card component="section" aria-label="Transactions">
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{
          p: { xs: 2, sm: 2.5 },
          justifyContent: 'space-between',
          alignItems: { sm: 'center' },
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <TransactionFilters
          category={category}
          sortBy={sortBy}
          onCategoryChange={(next) => onChange({ category: next })}
          onSortChange={(next) => onChange({ sortBy: next })}
        />
        {category && (
          <Chip
            size="small"
            variant="outlined"
            label={`Category: ${category}`}
            onDelete={() => onChange({ category: null })}
          />
        )}
      </Stack>
      <Box sx={{ height: 2 }}>
        {query.isFetching && query.isPlaceholderData && (
          <LinearProgress
            aria-label="Loading more transactions"
            sx={{ height: 2, borderRadius: 0 }}
          />
        )}
      </Box>
      <Box sx={{ p: { xs: 2, sm: 2.5 }, pt: { xs: 1.5, sm: 2 } }}>
        <SectionState
          query={query}
          loadingLabel="Loading transactions"
          skeleton={
            <Stack spacing={1}>
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} variant="rounded" height={44} />
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
                <Typography variant="caption" component="p" role="status" aria-live="polite">
                  {data.transactions.length > 0
                    ? `Showing ${formatNumber(first)}–${formatNumber(last)} of ${formatNumber(data.pagination.total)} transactions`
                    : 'No transactions on this page'}
                </Typography>
                <Box
                  sx={{ opacity: query.isPlaceholderData ? 0.6 : 1, transition: 'opacity 150ms' }}
                >
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
                    shape="rounded"
                    siblingCount={isWide ? 1 : 0}
                    boundaryCount={1}
                    getItemAriaLabel={(type, itemPage, selected) => {
                      if (type === 'page') {
                        return `${selected ? 'Current page, ' : 'Go to '}page ${itemPage}`;
                      }
                      if (type === 'previous') return 'Previous page';
                      if (type === 'next') return 'Next page';
                      return `Go to ${type} page`;
                    }}
                    sx={{
                      alignSelf: 'center',
                      '& .MuiPaginationItem-root.Mui-selected': {
                        bgcolor: 'text.primary',
                        color: 'common.white',
                        '&:hover, &.Mui-focusVisible': { bgcolor: 'text.primary' },
                      },
                    }}
                    aria-label="Transaction pages"
                  />
                )}
              </Stack>
            );
          }}
        </SectionState>
      </Box>
    </Card>
  );
}

interface TransactionsViewProps extends TransactionsPanelProps {
  onPeriodChange: (period: Period) => void;
}

export function TransactionsView({ onPeriodChange, ...panel }: TransactionsViewProps) {
  return (
    <>
      <PageHeader
        title="Transactions"
        description={`Everything you spent in the ${PERIOD_LABEL[panel.period]}.`}
        actions={<PeriodSelector value={panel.period} onChange={onPeriodChange} />}
      />
      <TransactionsPanel {...panel} />
    </>
  );
}
