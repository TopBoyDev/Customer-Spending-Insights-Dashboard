import {
  Box,
  Button,
  Card,
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
import { tokens } from '../theme/theme';
import { visuallyHiddenSx } from '../utils/a11y';
import { useMessages } from '../i18n/I18nProvider';
import { LOCALE } from '../i18n/locale';
import { formatNumber } from '../utils/format';

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
  const m = useMessages();
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

  const data = query.data;
  const resultSummary =
    data && data.pagination.total > 0
      ? data.transactions.length > 0
        ? m.transactions.showing(
            formatNumber(data.pagination.offset + 1),
            formatNumber(data.pagination.offset + data.transactions.length),
            formatNumber(data.pagination.total),
          )
        : m.transactions.emptyPage
      : '';

  return (
    <Card component="section" aria-label={m.transactions.title} sx={{ p: tokens.cardPadding }}>
      <Typography variant="h2" sx={visuallyHiddenSx}>
        {m.transactions.list}
      </Typography>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ mb: 2.5, justifyContent: 'space-between', alignItems: { sm: 'center' } }}
      >
        <TransactionFilters
          category={category}
          sortBy={sortBy}
          onCategoryChange={(next) => onChange({ category: next })}
          onSortChange={(next) => onChange({ sortBy: next })}
        />
        <Typography variant="caption" component="p" role="status" aria-live="polite">
          {resultSummary}
        </Typography>
      </Stack>
      <Box sx={{ height: 2, mb: 1 }}>
        {query.isFetching && query.isPlaceholderData && (
          <LinearProgress aria-label={m.transactions.loadingMore} sx={{ height: 2 }} />
        )}
      </Box>
      <SectionState
        query={query}
        loadingLabel={m.transactions.loading}
        skeleton={
          <Stack spacing={1}>
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} variant="rounded" height={48} />
            ))}
          </Stack>
        }
        errorTitle={m.transactions.error}
        isEmpty={(result) => result.pagination.total === 0}
        empty={
          <EmptyState
            title={
              category
                ? m.transactions.emptyCategory(category, m.period.last[period])
                : m.transactions.emptyAll(m.period.last[period])
            }
            description={hasFilters ? m.transactions.hintFiltered : m.transactions.hintPeriod}
            action={
              hasFilters && (
                <Button variant="contained" onClick={clearFilters}>
                  {m.transactions.clearFilters}
                </Button>
              )
            }
          />
        }
      >
        {(result) => {
          const caption = m.transactions.caption(
            m.period.last[period],
            category,
            m.transactions.sort[sortBy].toLocaleLowerCase(LOCALE),
          );
          return (
            <Stack spacing={3}>
              <Box sx={{ opacity: query.isPlaceholderData ? 0.6 : 1, transition: 'opacity 150ms' }}>
                {isWide ? (
                  <TransactionTable transactions={result.transactions} caption={caption} />
                ) : (
                  <TransactionList
                    transactions={result.transactions}
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
                      return m.transactions.page(itemPage ?? 0, selected);
                    }
                    if (type === 'previous') return m.transactions.previousPage;
                    if (type === 'next') return m.transactions.nextPage;
                    return m.transactions.otherPage(type);
                  }}
                  sx={{
                    alignSelf: 'center',
                    '& .MuiPaginationItem-root': { borderRadius: '10px', fontWeight: 600 },
                    '& .MuiPaginationItem-root.Mui-selected': {
                      bgcolor: tokens.color.accent,
                      color: tokens.color.onAccent,
                      '&:hover, &.Mui-focusVisible': { bgcolor: tokens.color.accent },
                    },
                  }}
                  aria-label={m.transactions.pages}
                />
              )}
            </Stack>
          );
        }}
      </SectionState>
    </Card>
  );
}

interface TransactionsViewProps extends TransactionsPanelProps {
  onPeriodChange: (period: Period) => void;
}

export function TransactionsView({ onPeriodChange, ...panel }: TransactionsViewProps) {
  const m = useMessages();
  return (
    <>
      <PageHeader
        title={m.views.transactions}
        actions={<PeriodSelector value={panel.period} onChange={onPeriodChange} />}
      />
      <TransactionsPanel {...panel} />
    </>
  );
}
