import { Box, Skeleton, Stack, Typography, useMediaQuery } from '@mui/material';
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis } from 'recharts';
import { toMonthKey } from '../../../shared/dates';
import { useApiMeta, useSpendingTrends } from '../../hooks/useInsightsQueries';
import { tokens } from '../../theme/theme';
import { formatCurrency, formatMonthShort } from '../../utils/format';
import { summariseTrends } from '../../utils/insights';
import { SectionCard } from '../common/SectionCard';
import { EmptyState, SectionState } from '../states/SectionState';

const SNAPSHOT_MONTHS = 6;

export function TrendSnapshot({ onMore }: { onMore: () => void }) {
  const query = useSpendingTrends(SNAPSHOT_MONTHS);
  const meta = useApiMeta();
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const currentMonth = meta.data ? toMonthKey(meta.data.dataAsOf) : undefined;

  return (
    <SectionCard
      title="Monthly spending"
      subtitle={`Last ${SNAPSHOT_MONTHS} months`}
      more={{ label: 'View trends', onClick: onMore }}
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
              <Box sx={{ height: 150 }} aria-hidden>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={points} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: tokens.color.textSecondary, fontSize: 12 }}
                    />
                    <Bar
                      dataKey="totalSpent"
                      radius={[4, 4, 4, 4]}
                      maxBarSize={32}
                      isAnimationActive={!reduceMotion}
                    >
                      {points.map((point) => (
                        <Cell
                          key={point.month}
                          fill={point.isPartial ? tokens.color.chartMuted : tokens.color.accent}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Stack>
          );
        }}
      </SectionState>
    </SectionCard>
  );
}
