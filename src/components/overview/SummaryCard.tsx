import { Box, Card, Skeleton, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { CATEGORY_BY_NAME } from '../../../shared/categories';
import type { Period, SpendingSummary } from '../../../shared/types';
import { useSpendingSummary } from '../../hooks/useInsightsQueries';
import { tokens } from '../../theme/theme';
import { formatCurrency, formatNumber, PERIOD_LABEL } from '../../utils/format';
import { describeCountChange, describeSpendingChange } from '../../utils/insights';
import { CategoryDot } from '../common/CategoryDot';
import { ChangeIndicator } from '../spending/ChangeIndicator';
import { EmptyState, SectionState } from '../states/SectionState';

function Stat({
  label,
  value,
  supporting,
}: {
  label: string;
  value: ReactNode;
  supporting?: ReactNode;
}) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" component="p">
        {label}
      </Typography>
      <Typography
        component="p"
        sx={{ fontSize: '1.125rem', fontWeight: 600, mt: 0.5, letterSpacing: '-0.01em' }}
      >
        {value}
      </Typography>
      {supporting && <Box sx={{ mt: 0.5 }}>{supporting}</Box>}
    </Box>
  );
}

function SummarySkeleton() {
  return (
    <Stack spacing={1.5} aria-hidden>
      <Skeleton variant="text" width={180} />
      <Skeleton variant="text" width={280} height={60} />
      <Skeleton variant="text" width={240} />
    </Stack>
  );
}

function SummaryContent({ summary }: { summary: SpendingSummary }) {
  const { period } = summary;
  const topCategory = summary.topCategory ? CATEGORY_BY_NAME[summary.topCategory] : null;

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={{ xs: 3, md: 4 }}
      sx={{ justifyContent: 'space-between', alignItems: { md: 'flex-end' } }}
    >
      <Box>
        <Typography variant="overline" component="p">
          Total spent · {PERIOD_LABEL[period]}
        </Typography>
        <Typography
          component="p"
          sx={{
            fontSize: { xs: '2.25rem', sm: '2.75rem' },
            fontWeight: 650,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            my: 0.75,
          }}
        >
          {formatCurrency(summary.totalSpent)}
        </Typography>
        <ChangeIndicator
          change={describeSpendingChange(summary.comparedToPrevious.spentChange, period)}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, minmax(0, auto))' },
          columnGap: { xs: 2, sm: 4 },
          rowGap: 2.5,
          pt: { xs: 2.5, md: 0 },
          borderTop: { xs: `1px solid ${tokens.color.border}`, md: 'none' },
          '& > *:not(:first-of-type)': {
            borderLeft: { sm: `1px solid ${tokens.color.border}` },
            pl: { sm: 4 },
          },
        }}
      >
        <Stat
          label="Transactions"
          value={formatNumber(summary.transactionCount)}
          supporting={
            <ChangeIndicator
              change={describeCountChange(summary.comparedToPrevious.transactionChange)}
            />
          }
        />
        <Stat label="Average transaction" value={formatCurrency(summary.averageTransaction)} />
        <Stat
          label="Top category"
          value={
            topCategory ? (
              <Stack component="span" direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <CategoryDot color={topCategory.color} />
                <span>{topCategory.name}</span>
              </Stack>
            ) : (
              'None'
            )
          }
        />
      </Box>
    </Stack>
  );
}

/** Headline metrics for the selected period. */
export function SummaryCard({ period }: { period: Period }) {
  const query = useSpendingSummary(period);
  return (
    <Card component="section" aria-label="Spending summary" sx={{ p: { xs: 2.5, sm: 3 } }}>
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
    </Card>
  );
}
