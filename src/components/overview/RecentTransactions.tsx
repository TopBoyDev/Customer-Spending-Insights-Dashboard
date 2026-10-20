import { Box, Skeleton, Stack, Typography } from '@mui/material';
import { DEFAULT_SORT, type Period } from '../../../shared/types';
import { useTransactions } from '../../hooks/useInsightsQueries';
import {
  formatCurrency,
  formatTransactionDate,
  formatTransactionTime,
  PERIOD_LABEL,
} from '../../utils/format';
import { CategoryIcon } from '../common/CategoryIcon';
import { SectionCard } from '../common/SectionCard';
import { EmptyState, SectionState } from '../states/SectionState';

const RECENT_COUNT = 5;

export function RecentTransactions({ period, onMore }: { period: Period; onMore: () => void }) {
  const query = useTransactions({ period, sortBy: DEFAULT_SORT, limit: RECENT_COUNT, offset: 0 });

  return (
    <SectionCard
      title="Recent transactions"
      subtitle={
        query.data
          ? `${query.data.pagination.total} in the ${PERIOD_LABEL[period]}`
          : `The ${PERIOD_LABEL[period]}`
      }
      more={{ label: 'transactions', onClick: onMore }}
    >
      <SectionState
        query={query}
        loadingLabel="Loading recent transactions"
        skeleton={
          <Stack spacing={1.5}>
            {Array.from({ length: RECENT_COUNT }, (_, index) => (
              <Skeleton key={index} variant="rounded" height={36} />
            ))}
          </Stack>
        }
        errorTitle="Recent transactions could not be loaded"
        isEmpty={(data) => data.transactions.length === 0}
        empty={<EmptyState title={`No transactions in the ${PERIOD_LABEL[period]}`} />}
      >
        {(data) => (
          <Box component="ul" sx={{ m: 0, p: 0, mt: -1 }}>
            {data.transactions.map((transaction) => (
              <Stack
                key={transaction.id}
                component="li"
                direction="row"
                spacing={1.5}
                sx={{ alignItems: 'center', py: 1, listStyle: 'none' }}
              >
                <CategoryIcon icon={transaction.icon} size={32} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                    {transaction.merchant}
                  </Typography>
                  <Typography variant="caption" component="p" noWrap>
                    {formatTransactionDate(transaction.date)} ·{' '}
                    {formatTransactionTime(transaction.date)}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                  −{formatCurrency(transaction.amount)}
                </Typography>
              </Stack>
            ))}
          </Box>
        )}
      </SectionState>
    </SectionCard>
  );
}
