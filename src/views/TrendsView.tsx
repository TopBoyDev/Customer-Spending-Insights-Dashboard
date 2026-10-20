import InsightsOutlined from '@mui/icons-material/InsightsOutlined';
import TrendingDownRounded from '@mui/icons-material/TrendingDownRounded';
import TrendingUpRounded from '@mui/icons-material/TrendingUpRounded';
import {
  Button,
  Collapse,
  Grid2 as Grid,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { lazy, Suspense, useId, useState } from 'react';
import { toMonthKey } from '../../shared/dates';
import type { ChartPoint } from '../components/charts/TrendChart';
import { SectionCard } from '../components/common/SectionCard';
import { useMessages } from '../i18n/I18nProvider';
import { StatCard } from '../components/common/StatCard';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState, SectionState } from '../components/states/SectionState';
import { TREND_MONTH_OPTIONS, type TrendMonths } from '../hooks/useDashboardFilters';
import { useApiMeta, useSpendingTrends } from '../hooks/useInsightsQueries';
import { tokens } from '../theme/theme';
import { formatCurrency, formatMonthLong, formatMonthShort, formatNumber } from '../utils/format';
import { summariseTrends } from '../utils/insights';

function TrendTable({ points, id }: { points: ChartPoint[]; id: string }) {
  const m = useMessages();
  return (
    <TableContainer id={id} sx={{ mt: 2, maxHeight: 360 }}>
      <Table size="small" stickyHeader>
        <caption>{m.trends.tableCaption}</caption>
        <TableHead>
          <TableRow>
            <TableCell component="th" scope="col">
              {m.trends.columns.month}
            </TableCell>
            <TableCell component="th" scope="col" align="right">
              {m.trends.columns.spent}
            </TableCell>
            <TableCell component="th" scope="col" align="right">
              {m.trends.columns.transactions}
            </TableCell>
            <TableCell component="th" scope="col" align="right">
              {m.trends.columns.average}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {points.map((point) => (
            <TableRow key={point.month}>
              <TableCell component="th" scope="row">
                {formatMonthLong(point.month)}
                {point.isPartial && m.trends.toDate}
              </TableCell>
              <TableCell align="right">{formatCurrency(point.totalSpent)}</TableCell>
              <TableCell align="right">{formatNumber(point.transactionCount)}</TableCell>
              <TableCell align="right">{formatCurrency(point.averageTransaction)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

interface TrendsViewProps {
  months: TrendMonths;
  onMonthsChange: (months: TrendMonths) => void;
}

const TrendChart = lazy(() => import('../components/charts/TrendChart'));

export function TrendsView({ months, onMonthsChange }: TrendsViewProps) {
  const m = useMessages();
  const query = useSpendingTrends(months);
  const meta = useApiMeta();
  const [showTable, setShowTable] = useState(false);
  const tableId = useId();
  const currentMonth = meta.data ? toMonthKey(meta.data.dataAsOf) : undefined;

  return (
    <>
      <PageHeader
        title={m.views.trends}
        actions={
          <ToggleButtonGroup
            value={months}
            exclusive
            size="small"
            aria-label={m.trends.monthsToShow}
            onChange={(_event, next: TrendMonths | null) => {
              if (next) onMonthsChange(next);
            }}
          >
            {TREND_MONTH_OPTIONS.map((option) => (
              <ToggleButton key={option} value={option}>
                {m.trends.monthsOption(option)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        }
      />
      <SectionState
        query={query}
        loadingLabel={m.trends.loading}
        skeleton={
          <Stack spacing={2.5}>
            <Skeleton variant="rounded" height={96} />
            <Skeleton variant="rounded" height={360} />
          </Stack>
        }
        errorTitle={m.trends.error}
        isEmpty={(data) => data.trends.every((trend) => trend.transactionCount === 0)}
        empty={<EmptyState title={m.trends.empty} />}
      >
        {(data) => {
          const points: ChartPoint[] = data.trends.map((trend) => ({
            ...trend,
            label: formatMonthShort(trend.month),
            isPartial: trend.month === currentMonth,
          }));
          const insight = summariseTrends(data.trends, currentMonth, m);
          return (
            <Grid
              container
              spacing={{ xs: 2, md: 3 }}
              sx={{ opacity: query.isPlaceholderData ? 0.6 : 1 }}
            >
              <Grid size={{ xs: 12, sm: 4 }}>
                <StatCard
                  icon={<InsightsOutlined />}
                  label={m.trends.monthlyAverage}
                  value={
                    insight.averageMonthly === null ? '—' : formatCurrency(insight.averageMonthly)
                  }
                  footnote={m.trends.overCompleteMonths(insight.completeMonths.length)}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <StatCard
                  icon={<TrendingUpRounded />}
                  label={m.trends.highestMonth}
                  value={insight.highest ? formatCurrency(insight.highest.totalSpent) : '—'}
                  footnote={insight.highest ? formatMonthLong(insight.highest.month) : undefined}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <StatCard
                  icon={<TrendingDownRounded />}
                  label={m.trends.lowestMonth}
                  value={insight.lowest ? formatCurrency(insight.lowest.totalSpent) : '—'}
                  footnote={insight.lowest ? formatMonthLong(insight.lowest.month) : undefined}
                />
              </Grid>
              <Grid size={12}>
                <SectionCard
                  title={m.trends.snapshotTitle}
                  subtitle={
                    currentMonth ? m.trends.monthToDate(formatMonthShort(currentMonth)) : undefined
                  }
                  action={
                    <Button
                      size="small"

                      onClick={() => setShowTable((value) => !value)}
                      aria-expanded={showTable}
                      aria-controls={tableId}
                      sx={{
                        bgcolor: tokens.color.surfaceMuted,
                        color: 'text.primary',
                        px: 1.5,
                        '&:hover': { bgcolor: tokens.color.accentSoft },
                      }}
                    >
                      {showTable ? m.trends.hideTable : m.trends.showTable}
                    </Button>
                  }
                >
                  <Stack spacing={2}>
                    <Suspense fallback={<Skeleton variant="rounded" height={280} />}>
                      <TrendChart points={points} averageMonthly={insight.averageMonthly} />
                    </Suspense>
                    <Collapse in={showTable} unmountOnExit>
                      <TrendTable points={points} id={tableId} />
                    </Collapse>
                  </Stack>
                </SectionCard>
              </Grid>
            </Grid>
          );
        }}
      </SectionState>
    </>
  );
}
