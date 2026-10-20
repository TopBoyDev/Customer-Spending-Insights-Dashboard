import ArrowDownwardRounded from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRounded from '@mui/icons-material/ArrowUpwardRounded';
import HorizontalRuleRounded from '@mui/icons-material/HorizontalRuleRounded';
import PaymentsOutlined from '@mui/icons-material/PaymentsOutlined';
import ReceiptLongOutlined from '@mui/icons-material/ReceiptLongOutlined';
import { Box, Card, Grid2 as Grid, Skeleton, Stack, Typography } from '@mui/material';
import { CATEGORY_BY_NAME } from '../../../shared/categories';
import type { Period, SpendingSummary } from '../../../shared/types';
import { useSpendingSummary } from '../../hooks/useInsightsQueries';
import { tokens } from '../../theme/theme';
import { formatCurrency, formatNumber, PERIOD_LABEL } from '../../utils/format';
import {
  describeCountChange,
  describeSpendingChange,
  type ChangeDescription,
} from '../../utils/insights';
import { CategoryDot } from '../common/CategoryDot';
import { CategoryIcon } from '../common/CategoryIcon';
import { StatCard } from '../common/StatCard';
import { ChangeIndicator } from '../spending/ChangeIndicator';
import { EmptyState, SectionState } from '../states/SectionState';

const CHANGE_ICON = {
  up: ArrowUpwardRounded,
  down: ArrowDownwardRounded,
  flat: HorizontalRuleRounded,
  none: HorizontalRuleRounded,
} as const;

/** The one high-contrast surface on the page: where the eye should land first. */
function HeroCard({ summary }: { summary: SpendingSummary }) {
  const change: ChangeDescription = describeSpendingChange(
    summary.comparedToPrevious.spentChange,
    summary.period,
  );
  const Icon = CHANGE_ICON[change.direction];
  return (
    <Card
      sx={{
        height: '100%',
        p: tokens.cardPadding,
        position: 'relative',
        overflow: 'hidden',
        color: tokens.color.onAccent,
        background: tokens.gradient.accent,
        boxShadow: tokens.shadow.accent,
        // Two soft rings give the surface depth without adding information.
        '&::before, &::after': {
          content: '""',
          position: 'absolute',
          borderRadius: '50%',
          border: '28px solid rgba(255, 255, 255, 0.05)',
          pointerEvents: 'none',
        },
        '&::before': { width: 260, height: 260, right: -90, top: -110 },
        '&::after': { width: 180, height: 180, right: 40, bottom: -120 },
      }}
    >
      <Typography
        component="p"
        sx={{ fontSize: '0.875rem', fontWeight: 500, color: tokens.color.onAccentMuted }}
      >
        Total spent · {PERIOD_LABEL[summary.period]}
      </Typography>
      <Typography
        component="p"
        sx={{
          fontSize: { xs: '2.25rem', sm: '2.75rem' },
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
          mt: 1,
          mb: 2.5,
        }}
      >
        {formatCurrency(summary.totalSpent)}
      </Typography>
      <Stack
        direction="row"
        spacing={0.75}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          px: 1.25,
          py: 0.5,
          borderRadius: tokens.radius.pill,
          bgcolor: 'rgba(255, 255, 255, 0.14)',
        }}
      >
        <Icon aria-hidden sx={{ fontSize: 16 }} />
        <Typography component="span" sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>
          {change.text}
        </Typography>
      </Stack>
    </Card>
  );
}

function SummaryContent({ summary }: { summary: SpendingSummary }) {
  const topCategory = summary.topCategory ? CATEGORY_BY_NAME[summary.topCategory] : null;
  return (
    <Grid container spacing={{ xs: 2, md: 3 }}>
      <Grid size={{ xs: 12, lg: 4 }}>
        <HeroCard summary={summary} />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, lg: 8 / 3 }}>
        <StatCard
          icon={<ReceiptLongOutlined />}
          label="Transactions"
          value={formatNumber(summary.transactionCount)}
          supporting={
            <ChangeIndicator
              change={describeCountChange(summary.comparedToPrevious.transactionChange)}
            />
          }
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, lg: 8 / 3 }}>
        <StatCard
          icon={<PaymentsOutlined />}
          label="Average transaction"
          value={formatCurrency(summary.averageTransaction)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4, lg: 8 / 3 }}>
        <StatCard
          icon={topCategory ? <CategoryIcon icon={topCategory.icon} size={21} bare /> : null}
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
      </Grid>
    </Grid>
  );
}

function SummarySkeleton() {
  return (
    <Grid container spacing={{ xs: 2, md: 3 }} aria-hidden>
      <Grid size={{ xs: 12, lg: 4 }}>
        <Skeleton variant="rounded" height={176} sx={{ borderRadius: `${tokens.radius.card}px` }} />
      </Grid>
      {[0, 1, 2].map((key) => (
        <Grid key={key} size={{ xs: 12, sm: 4, lg: 8 / 3 }}>
          <Skeleton
            variant="rounded"
            height={176}
            sx={{ borderRadius: `${tokens.radius.card}px` }}
          />
        </Grid>
      ))}
    </Grid>
  );
}

/** Headline metrics for the selected period. */
export function SummaryCard({ period }: { period: Period }) {
  const query = useSpendingSummary(period);
  return (
    <Box component="section" aria-label="Spending summary">
      <SectionState
        query={query}
        loadingLabel="Loading spending summary"
        skeleton={<SummarySkeleton />}
        errorTitle="Your spending summary could not be loaded"
        isEmpty={(summary) => summary.transactionCount === 0}
        empty={
          <Card sx={{ p: tokens.cardPadding }}>
            <EmptyState
              title={`No spending in the ${PERIOD_LABEL[period]}`}
              description="Try a longer period to see your spending."
            />
          </Card>
        }
      >
        {(summary) => <SummaryContent summary={summary} />}
      </SectionState>
    </Box>
  );
}
