import { Box, Skeleton, Stack, Typography } from '@mui/material';
import { DEFAULT_SORT, type Period } from '../../../shared/types';
import { useTransactions } from '../../hooks/useInsightsQueries';
import {
  formatCurrency,
  formatTransactionDate,
  formatNumber,
  formatTransactionTime,
} from '../../utils/format';
import { useMessages } from '../../i18n/I18nProvider';
import { CategoryIcon } from '../common/CategoryIcon';
import { SectionCard } from '../common/SectionCard';
import { EmptyState, SectionState } from '../states/SectionState';

const RECENT_COUNT = 5;

export function RecentTransactions({ period, onMore }: { period: Period; onMore: () => void }) {
  const m = useMessages();
  const query = useTransactions({ period, sortBy: DEFAULT_SORT, limit: RECENT_COUNT, offset: 0 });

  return (
    <SectionCard
      title={m.transactions.recent}
      subtitle={
        query.data
          ? m.transactions.countInPeriod(
              formatNumber(query.data.pagination.total),
              m.period.last[period],
            )
          : undefined
      }
      more={{ label: m.transactions.viewAll, onClick: onMore }}
    >
      <SectionState
        query={query}
        loadingLabel={m.transactions.recentLoading}
        skeleton={
          <Stack spacing={1.5}>
            {Array.from({ length: RECENT_COUNT }, (_, index) => (
              <Skeleton key={index} variant="rounded" height={36} />
            ))}
          </Stack>
        }
        errorTitle={m.transactions.recentError}
        isEmpty={(data) => data.transactions.length === 0}
        empty={<EmptyState title={m.transactions.emptyAll(m.period.last[period])} />}
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
