import { Box, useMediaQuery } from '@mui/material';
import { useId } from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis } from 'recharts';
import { useAppColors } from '../../theme/theme';
import { barGradientDefs, svgSafeId } from '../../utils/charts';

export interface MiniTrendPoint {
  month: string;
  label: string;
  totalSpent: number;
  isPartial: boolean;
}

/**
 * Small bar chart for the overview. Lives in its own module so the chart
 * library is loaded lazily, off the critical rendering path.
 */
export default function MiniTrendChart({ points }: { points: MiniTrendPoint[] }) {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const colors = useAppColors();
  const gradientId = svgSafeId(`trend-snapshot-${useId()}`);
  return (
    <Box sx={{ height: 150 }} aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={points} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          {barGradientDefs(gradientId, colors)}
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: colors.textSecondary, fontSize: 12 }}
          />
          <Bar
            dataKey="totalSpent"
            radius={[8, 8, 8, 8]}
            maxBarSize={32}
            isAnimationActive={!reduceMotion}
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
