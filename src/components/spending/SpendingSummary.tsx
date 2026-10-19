import { Box, Grid2 as Grid, Skeleton, Stack, Typography } from '@mui/material';
import { CATEGORY_BY_NAME } from '../../../shared/categories';
import type { Period, SpendingSummary as SpendingSummaryData } from '../../../shared/types';
import { useSpendingSummary } from '../../hooks/useInsightsQueries';
import { formatCurrency, formatNumber, PERIOD_LABEL } from '../../utils/format';
import { describeCountChange, describeSpendingChange } from '../../utils/insights';
import { CategoryIcon } from '../common/CategoryIcon';
import { SectionCard } from '../common/SectionCard';
import { EmptyState, SectionState } from '../states/SectionState';
import { ChangeIndicator } from './ChangeIndicator';
import { MetricCard } from './MetricCard';

function SummarySkeleton() {
  return (
    <Stack spacing={2}>
      <Skeleton variant="text" width={160} />
      <Skeleton variant="text" width={260} height={56} />
      <Skeleton variant="text" width={240} />
      <Grid container spacing={1.5}>
        {[0, 1, 2].map((key) => (
          <Grid key={key} size={{ xs: 12, sm: 4 }}>
            <Skeleton variant="rounded" height={96} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

function SummaryContent({ summary }: { summary: SpendingSummaryData }) {
  const { period } = summary;
  const topCategory = summary.topCategory ? CATEGORY_BY_NAME[summary.topCategory] : null;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="body1" color="text.secondary">
          You spent
        </Typography>
        <Typography
          component="p"
          sx={{
            fontSize: { xs: '2.25rem', sm: '2.75rem' },
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: 'text.primary',
          }}
        >
          {formatCurrency(summary.totalSpent)}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          in the {PERIOD_LABEL[period]}
        </Typography>
        <ChangeIndicator
          size="body1"
          change={describeSpendingChange(summary.comparedToPrevious.spentChange, period)}
        />
      </Box>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <MetricCard
            label="Transactions"
            value={formatNumber(summary.transactionCount)}
            supporting={
              <ChangeIndicator
                change={describeCountChange(summary.comparedToPrevious.transactionChange, period)}
              />
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <MetricCard
            label="Average transaction"
            value={formatCurrency(summary.averageTransaction)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <MetricCard
            label="Top category"
            value={
              topCategory ? (
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }} component="span">
                  <CategoryIcon icon={topCategory.icon} color={topCategory.color} size={28} />
                  <span>{topCategory.name}</span>
                </Stack>
              ) : (
                'None'
              )
            }
          />
        </Grid>
      </Grid>
    </Stack>
  );
}

export function SpendingSummary({ period }: { period: Period }) {
  const query = useSpendingSummary(period);
  return (
    <SectionCard title="Spending summary">
      <SectionState
        query={query}
        loadingLabel="Loading spending summary"
        skeleton={<SummarySkeleton />}
        errorTitle="Your spending summary could not be loaded"
        isEmpty={(summary) => summary.transactionCount === 0}
        empty={
          <EmptyState
            title={`No spending in the ${PERIOD_LABEL[period]}`}
            description="Try a longer period to see your spending."
          />
        }
      >
        {(summary) => <SummaryContent summary={summary} />}
      </SectionState>
    </SectionCard>
  );
}
