import { Box, Typography, useMediaQuery, type Theme } from '@mui/material';
import { useId } from 'react';
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
import type { MonthlyTrend } from '../../../shared/types';
import { tokens, useAppColors } from '../../theme/theme';
import { barGradientDefs, svgSafeId } from '../../utils/charts';
import {
  formatCurrency,
  formatCurrencyAxis,
  formatMonthLong,
  formatNumber,
} from '../../utils/format';

/*
 * Code-split from the Trends view so the chart library loads after the stat
 * cards and text have rendered.
 */

export interface ChartPoint extends MonthlyTrend {
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
        boxShadow: tokens.shadow.raised,
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

export default function TrendChart({
  points,
  averageMonthly,
}: {
  points: ChartPoint[];
  averageMonthly: number | null;
}) {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const colors = useAppColors();
  const gradientId = svgSafeId(`trend-chart-${useId()}`);
  const isNarrow = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  // Let Recharts skip labels that would collide on small screens or long ranges.
  const compactAxis = isNarrow || points.length > 12;

  return (
    <Box sx={{ width: '100%', height: { xs: 240, sm: 300 } }} aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          {barGradientDefs(gradientId, colors)}
          <CartesianGrid vertical={false} stroke={colors.border} strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: colors.textSecondary, fontSize: 12 }}
            interval={compactAxis ? 'preserveStartEnd' : 0}
            minTickGap={8}
          />
          <YAxis
            tickFormatter={formatCurrencyAxis}
            tickLine={false}
            axisLine={false}
            width={56}
            tick={{ fill: colors.textSecondary, fontSize: 12 }}
          />
          <Tooltip content={<TrendTooltip />} cursor={{ fill: colors.surfaceMuted }} />
          {averageMonthly !== null && (
            <ReferenceLine
              y={averageMonthly}
              stroke={colors.textSecondary}
              strokeDasharray="4 4"
              label={{
                value: 'Average',
                position: 'insideTopRight',
                fill: colors.textSecondary,
                fontSize: 12,
              }}
            />
          )}
          <Bar
            dataKey="totalSpent"
            radius={[8, 8, 2, 2]}
            isAnimationActive={!reduceMotion}
            maxBarSize={32}
          >
            {points.map((point) => (
              <Cell
                key={point.month}
                fill={point.isPartial ? colors.chartMuted : `url(#${gradientId})`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
