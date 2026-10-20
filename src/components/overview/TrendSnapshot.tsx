import { Box, Skeleton, Stack, Typography } from '@mui/material';
import { lazy, Suspense } from 'react';
import { toMonthKey } from '../../../shared/dates';
import { useApiMeta, useSpendingTrends } from '../../hooks/useInsightsQueries';
import { formatCurrency, formatMonthShort } from '../../utils/format';
import { summariseTrends } from '../../utils/insights';
import { SectionCard } from '../common/SectionCard';
import { EmptyState, SectionState } from '../states/SectionState';

const SNAPSHOT_MONTHS = 6;

const MiniTrendChart = lazy(() => import('./MiniTrendChart'));

export function TrendSnapshot({ onMore }: { onMore: () => void }) {
  const query = useSpendingTrends(SNAPSHOT_MONTHS);
  const meta = useApiMeta();
  const currentMonth = meta.data ? toMonthKey(meta.data.dataAsOf) : undefined;

  return (
    <SectionCard
      title="Monthly spending"
      subtitle={`Last ${SNAPSHOT_MONTHS} months`}
      more={{ label: 'trends', onClick: onMore }}
    >
      <SectionState
        query={query}
        loadingLabel="Loading monthly spending"
        skeleton={<Skeleton variant="rounded" height={180} />}
        errorTitle="Monthly spending could not be loaded"
        isEmpty={(data) => data.trends.every((trend) => trend.transactionCount === 0)}
        empty={<EmptyState title="No spending in these months" />}
      >
        {(data) => {
          const insight = summariseTrends(data.trends, currentMonth);
          const points = data.trends.map((trend) => ({
            ...trend,
            label: formatMonthShort(trend.month),
            isPartial: trend.month === currentMonth,
          }));
          return (
            <Stack spacing={2}>
              {insight.averageMonthly !== null && (
                <Box>
                  <Typography variant="caption" component="p">
                    Monthly average
                  </Typography>
                  <Typography
                    sx={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.01em' }}
                  >
                    {formatCurrency(insight.averageMonthly)}
                  </Typography>
                </Box>
              )}
              <Suspense fallback={<Skeleton variant="rounded" height={150} />}>
                <MiniTrendChart points={points} />
              </Suspense>
            </Stack>
          );
        }}
      </SectionState>
    </SectionCard>
  );
}
