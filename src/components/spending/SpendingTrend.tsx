import {
  Box,
  Button,
  Collapse,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  type Theme,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useId, useState } from 'react';
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
import { toMonthKey } from '../../../shared/dates';
import type { MonthlyTrend } from '../../../shared/types';
import { TREND_MONTH_OPTIONS, type TrendMonths } from '../../hooks/useDashboardFilters';
import { useApiMeta, useSpendingTrends } from '../../hooks/useInsightsQueries';
import { tokens } from '../../theme/theme';
import {
  formatCurrency,
  formatCurrencyAxis,
  formatMonthLong,
  formatMonthShort,
  formatNumber,
} from '../../utils/format';
import { summariseTrends } from '../../utils/insights';
import { SectionCard } from '../common/SectionCard';
import { BlockSkeleton, EmptyState, SectionState } from '../states/SectionState';

interface SpendingTrendProps {
  months: TrendMonths;
  onMonthsChange: (months: TrendMonths) => void;
}

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
        borderRadius: 1,
        px: 1.5,
        py: 1,
        boxShadow: 2,
      }}
    >
      <Typography variant="subtitle2">
        {formatMonthLong(point.month)}
        {point.isPartial && ' (to date)'}
      </Typography>
      <Typography variant="body2">{formatCurrency(point.totalSpent)}</Typography>
      <Typography variant="caption" color="text.secondary">
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
    <Box sx={{ width: '100%', height: { xs: 240, sm: 280 } }} aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke={tokens.color.border} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: tokens.color.border }}
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
          <Tooltip content={<TrendTooltip />} cursor={{ fill: tokens.color.primarySoft }} />
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
            maxBarSize={40}
          >
            {points.map((point) => (
              <Cell
                key={point.month}
                fill={point.isPartial ? tokens.color.chartMuted : tokens.color.primary}
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

export function SpendingTrend({ months, onMonthsChange }: SpendingTrendProps) {
  const query = useSpendingTrends(months);
  const meta = useApiMeta();
  const [showTable, setShowTable] = useState(false);
  const tableId = useId();
  const currentMonth = meta.data ? toMonthKey(meta.data.dataAsOf) : undefined;

  return (
    <SectionCard
      title="Monthly spending trend"
      subtitle={`The last ${months} months, independent of the period selected above`}
      action={
        <ToggleButtonGroup
          value={months}
          exclusive
          size="small"
          color="primary"
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
    >
      <SectionState
        query={query}
        loadingLabel="Loading monthly spending trend"
        skeleton={<BlockSkeleton height={260} lines={2} />}
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
            <Stack spacing={2} sx={{ opacity: query.isPlaceholderData ? 0.6 : 1 }}>
              <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                {insight.sentences.map((sentence) => (
                  <Typography component="li" variant="body2" key={sentence}>
                    {sentence}
                  </Typography>
                ))}
              </Box>
              <TrendChart points={points} averageMonthly={insight.averageMonthly} />
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
              >
                <Typography variant="caption" color="text.secondary">
                  {currentMonth &&
                    `${formatMonthLong(currentMonth)} is still in progress and is shown in a lighter colour. `}
                  The dashed line is the average of complete months.
                </Typography>
                <Button
                  size="small"
                  onClick={() => setShowTable((value) => !value)}
                  aria-expanded={showTable}
                  aria-controls={tableId}
                  sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, flexShrink: 0 }}
                >
                  {showTable ? 'Hide data table' : 'Show data table'}
                </Button>
              </Stack>
              <Collapse in={showTable} unmountOnExit>
                <TrendTable points={points} id={tableId} />
              </Collapse>
            </Stack>
          );
        }}
      </SectionState>
    </SectionCard>
  );
}
