import { Box, Stack, Typography, useMediaQuery } from '@mui/material';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { SpendingByCategory } from '../../../shared/types';
import { tokens } from '../../theme/theme';
import { formatCurrency, formatPercent } from '../../utils/format';

/* Code-split from the Categories view so the chart library loads after the list. */

function chartSummary(data: SpendingByCategory): string {
  const parts = data.categories.map(
    (category) => `${category.name} ${formatPercent(category.percentage)}`,
  );
  return `Donut chart of spending by category: ${parts.join(', ')}.`;
}

export default function CategoryDonut({ data }: { data: SpendingByCategory }) {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  return (
    <Box
      role="img"
      aria-label={chartSummary(data)}
      sx={{ position: 'relative', width: '100%', maxWidth: 260, height: 260, mx: 'auto' }}
    >
      {/* The labelled wrapper and the category list are the accessible equivalent. */}
      <Box aria-hidden sx={{ width: '100%', height: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.categories}
              dataKey="amount"
              nameKey="name"
              innerRadius="78%"
              outerRadius="100%"
              paddingAngle={3}
              cornerRadius={6}
              stroke="none"
              isAnimationActive={!reduceMotion}
              rootTabIndex={-1}
            >
              {data.categories.map((category) => (
                <Cell key={category.name} fill={category.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [formatCurrency(value), name]}
              contentStyle={{
                borderRadius: 10,
                border: `1px solid ${tokens.color.border}`,
                background: tokens.color.surface,
                color: tokens.color.textPrimary,
                fontSize: 13,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
      <Stack
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <Typography variant="caption">Total spent</Typography>
        <Typography sx={{ fontWeight: 650, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
          {formatCurrency(data.totalAmount)}
        </Typography>
      </Stack>
    </Box>
  );
}
