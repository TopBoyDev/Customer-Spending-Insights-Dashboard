import {
  Box,
  Button,
  Card,
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
  Typography,
  useMediaQuery,
  type Theme,
} from '@mui/material';
import { useId, useState, type ReactNode } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { toMonthKey } from '../../shared/dates';
import type { MonthlyTrend } from '../../shared/types';
import { SectionCard } from '../components/common/SectionCard';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState, SectionState } from '../components/states/SectionState';
import { TREND_MONTH_OPTIONS, type TrendMonths } from '../hooks/useDashboardFilters';
import { useApiMeta, useSpendingTrends } from '../hooks/useInsightsQueries';
import { tokens } from '../theme/theme';
import {
  formatCurrency,
  formatCurrencyAxis,
  formatMonthLong,
  formatMonthShort,
  formatNumber,
} from '../utils/format';
import { summariseTrends } from '../utils/insights';

interface ChartPoint extends MonthlyTrend {
  label: string;
  isPartial: boolean;
}

function TrendTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ChartPoint }[];
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        px: 1.5,
        py: 1,
        boxShadow: '0 4px 16px rgba(17, 24, 39, 0.08)',
      }}
    >
      <Typography variant="caption" component="p">
        {formatMonthLong(point.month)}
        {point.isPartial && ' (to date)'}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {formatCurrency(point.totalSpent)}
      </Typography>
      <Typography variant="caption" component="p">
        {formatNumber(point.transactionCount)} transactions · avg{' '}
        {formatCurrency(point.averageTransaction)}
      </Typography>
    </Box>
  );
}

function TrendChart({
  points,
  averageMonthly,
}: {
  points: ChartPoint[];
  averageMonthly: number | null;
}) {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const isNarrow = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  // Let Recharts skip labels that would collide on small screens or long ranges.
  const compactAxis = isNarrow || points.length > 12;

  return (
    <Box sx={{ width: '100%', height: { xs: 240, sm: 300 } }} aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke={tokens.color.border} strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: tokens.color.textSecondary, fontSize: 12 }}
            interval={compactAxis ? 'preserveStartEnd' : 0}
            minTickGap={8}
          />
          <YAxis
            tickFormatter={formatCurrencyAxis}
            tickLine={false}
            axisLine={false}
            width={56}
            tick={{ fill: tokens.color.textSecondary, fontSize: 12 }}
          />
          <Tooltip content={<TrendTooltip />} cursor={{ fill: tokens.color.surfaceMuted }} />
          {averageMonthly !== null && (
            <ReferenceLine
              y={averageMonthly}
              stroke={tokens.color.textSecondary}
              strokeDasharray="4 4"
              label={{
                value: 'Average',
                position: 'insideTopRight',
                fill: tokens.color.textSecondary,
                fontSize: 12,
              }}
            />
          )}
          <Bar
            dataKey="totalSpent"
            radius={[4, 4, 0, 0]}
            isAnimationActive={!reduceMotion}
            maxBarSize={36}
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
  );
}

function TrendTable({ points, id }: { points: ChartPoint[]; id: string }) {
  return (
    <TableContainer id={id} sx={{ mt: 2, maxHeight: 360 }}>
      <Table size="small" stickyHeader>
        <caption>Monthly spending, oldest first</caption>
        <TableHead>
          <TableRow>
            <TableCell component="th" scope="col">
              Month
            </TableCell>
            <TableCell component="th" scope="col" align="right">
              Spent
            </TableCell>
            <TableCell component="th" scope="col" align="right">
              Transactions
            </TableCell>
            <TableCell component="th" scope="col" align="right">
              Average
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {points.map((point) => (
            <TableRow key={point.month}>
              <TableCell component="th" scope="row">
                {formatMonthLong(point.month)}
                {point.isPartial && ' (to date)'}
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

function StatCard({ label, value, detail }: { label: string; value: ReactNode; detail?: string }) {
  return (
    <Card sx={{ p: 2.5, height: '100%' }}>
      <Typography variant="caption" component="p">
        {label}
      </Typography>
      <Typography
        component="p"
        sx={{ fontSize: '1.375rem', fontWeight: 650, letterSpacing: '-0.02em', mt: 0.5 }}
      >
        {value}
      </Typography>
      {detail && (
        <Typography variant="caption" component="p" sx={{ mt: 0.25 }}>
          {detail}
        </Typography>
      )}
    </Card>
  );
}

interface TrendsViewProps {
  months: TrendMonths;
  onMonthsChange: (months: TrendMonths) => void;
}

export function TrendsView({ months, onMonthsChange }: TrendsViewProps) {
  const query = useSpendingTrends(months);
  const meta = useApiMeta();
  const [showTable, setShowTable] = useState(false);
  const tableId = useId();
  const currentMonth = meta.data ? toMonthKey(meta.data.dataAsOf) : undefined;

  return (
    <>
      <PageHeader
        title="Trends"
        actions={
          <ToggleButtonGroup
            value={months}
            exclusive
            size="small"
            aria-label="Months to show"
            onChange={(_event, next: TrendMonths | null) => {
              if (next) onMonthsChange(next);
            }}
          >
            {TREND_MONTH_OPTIONS.map((option) => (
              <ToggleButton key={option} value={option}>
                {option} months
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        }
      />
      <SectionState
        query={query}
        loadingLabel="Loading monthly spending trend"
        skeleton={
          <Stack spacing={2.5}>
            <Skeleton variant="rounded" height={96} />
            <Skeleton variant="rounded" height={360} />
          </Stack>
        }
        errorTitle="Your spending trend could not be loaded"
        isEmpty={(data) => data.trends.every((trend) => trend.transactionCount === 0)}
        empty={<EmptyState title="No spending in these months" />}
      >
        {(data) => {
          const points: ChartPoint[] = data.trends.map((trend) => ({
            ...trend,
            label: formatMonthShort(trend.month),
            isPartial: trend.month === currentMonth,
          }));
          const insight = summariseTrends(data.trends, currentMonth);
          return (
            <Grid
              container
              spacing={{ xs: 2, md: 2.5 }}
              sx={{ opacity: query.isPlaceholderData ? 0.6 : 1 }}
            >
              <Grid size={{ xs: 12, sm: 4 }}>
                <StatCard
                  label="Monthly average"
                  value={
                    insight.averageMonthly === null ? '—' : formatCurrency(insight.averageMonthly)
                  }
                  detail={`${insight.completeMonths.length} complete months`}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <StatCard
                  label="Highest month"
                  value={insight.highest ? formatCurrency(insight.highest.totalSpent) : '—'}
                  detail={insight.highest ? formatMonthLong(insight.highest.month) : undefined}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <StatCard
                  label="Lowest month"
                  value={insight.lowest ? formatCurrency(insight.lowest.totalSpent) : '—'}
                  detail={insight.lowest ? formatMonthLong(insight.lowest.month) : undefined}
                />
              </Grid>
              <Grid size={12}>
                <SectionCard
                  title="Monthly spending"
                  subtitle={
                    currentMonth ? `${formatMonthShort(currentMonth)} is month to date` : undefined
                  }
                  action={
                    <Button
                      size="small"
                      variant="outlined"
                      color="inherit"
                      onClick={() => setShowTable((value) => !value)}
                      aria-expanded={showTable}
                      aria-controls={tableId}
                      sx={{ borderColor: 'divider' }}
                    >
                      {showTable ? 'Hide data table' : 'Show data table'}
                    </Button>
                  }
                >
                  <Stack spacing={2}>
                    <TrendChart points={points} averageMonthly={insight.averageMonthly} />
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
