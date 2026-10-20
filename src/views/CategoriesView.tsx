import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import {
  Box,
  ButtonBase,
  Grid2 as Grid,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { CategoryName } from '../../shared/categories';
import type { CategorySpending, Period, SpendingByCategory } from '../../shared/types';
import { CategoryDot } from '../components/common/CategoryDot';
import { SectionCard } from '../components/common/SectionCard';
import { PeriodSelector } from '../components/dashboard/PeriodSelector';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState, SectionState } from '../components/states/SectionState';
import { useSpendingCategories } from '../hooks/useInsightsQueries';
import { tokens } from '../theme/theme';
import {
  formatCurrency,
  formatDateRange,
  formatNumber,
  formatPercent,
  PERIOD_LABEL,
} from '../utils/format';

function chartSummary(data: SpendingByCategory): string {
  const parts = data.categories.map(
    (category) => `${category.name} ${formatPercent(category.percentage)}`,
  );
  return `Donut chart of spending by category: ${parts.join(', ')}.`;
}

function CategoryDonut({ data }: { data: SpendingByCategory }) {
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
              innerRadius="72%"
              outerRadius="100%"
              paddingAngle={1.5}
              stroke={tokens.color.surface}
              strokeWidth={2}
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

function CategoryRow({
  category,
  maxPercentage,
  onSelect,
}: {
  category: CategorySpending;
  maxPercentage: number;
  onSelect: () => void;
}) {
  const transactionLabel = `${formatNumber(category.transactionCount)} ${category.transactionCount === 1 ? 'transaction' : 'transactions'}`;
  return (
    <ButtonBase
      onClick={onSelect}
      aria-label={`${category.name}: ${formatCurrency(category.amount)}, ${formatPercent(category.percentage)} of spending, ${transactionLabel}. Show these transactions`}
      sx={{
        width: '100%',
        textAlign: 'left',
        borderRadius: 2,
        px: 1.5,
        py: 1.5,
        display: 'flex',
        gap: 2,
        alignItems: 'center',
        '&:hover': { bgcolor: tokens.color.surfaceMuted },
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <CategoryDot color={category.color} />
          <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, minWidth: 0 }} noWrap>
            {category.name}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
            {formatCurrency(category.amount)}
          </Typography>
        </Stack>
        <Box
          aria-hidden
          sx={{
            mt: 1,
            height: 4,
            borderRadius: 2,
            bgcolor: tokens.color.track,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: `${maxPercentage === 0 ? 0 : (category.percentage / maxPercentage) * 100}%`,
              bgcolor: category.color,
              borderRadius: 2,
            }}
          />
        </Box>
        <Stack direction="row" sx={{ justifyContent: 'space-between', mt: 0.75 }}>
          <Typography variant="caption">{transactionLabel}</Typography>
          <Typography variant="caption">{formatPercent(category.percentage)} of total</Typography>
        </Stack>
      </Box>
      <ChevronRightRounded aria-hidden sx={{ color: 'text.secondary', fontSize: 20 }} />
    </ButtonBase>
  );
}

interface CategoriesViewProps {
  period: Period;
  onPeriodChange: (period: Period) => void;
  onSelectCategory: (category: CategoryName) => void;
}

export function CategoriesView({ period, onPeriodChange, onSelectCategory }: CategoriesViewProps) {
  const query = useSpendingCategories(period);
  const range = query.data
    ? formatDateRange(query.data.dateRange.startDate, query.data.dateRange.endDate)
    : null;

  return (
    <>
      <PageHeader
        title="Categories"
        actions={<PeriodSelector value={period} onChange={onPeriodChange} />}
      />
      <SectionState
        query={query}
        loadingLabel="Loading spending by category"
        skeleton={
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Skeleton variant="rounded" height={340} />
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <Skeleton variant="rounded" height={340} />
            </Grid>
          </Grid>
        }
        errorTitle="Category spending could not be loaded"
        isEmpty={(data) => data.categories.length === 0}
        empty={
          <EmptyState
            title={`No spending in the ${PERIOD_LABEL[period]}`}
            description="Categories appear here once you have transactions in this period."
          />
        }
      >
        {(data) => {
          const maxPercentage = Math.max(0, ...data.categories.map((c) => c.percentage));
          return (
            <Grid container spacing={{ xs: 2, md: 2.5 }}>
              <Grid size={{ xs: 12, md: 5 }}>
                <SectionCard title="Share of spending" subtitle={range}>
                  <Stack spacing={2.5} sx={{ alignItems: 'center' }}>
                    <CategoryDonut data={data} />
                  </Stack>
                </SectionCard>
              </Grid>
              <Grid size={{ xs: 12, md: 7 }}>
                <SectionCard title="Breakdown">
                  <Box component="ul" sx={{ m: 0, p: 0, mx: -1.5, listStyle: 'none' }}>
                    {data.categories.map((category) => (
                      <li key={category.name}>
                        <CategoryRow
                          category={category}
                          maxPercentage={maxPercentage}
                          onSelect={() => onSelectCategory(category.name)}
                        />
                      </li>
                    ))}
                  </Box>
                </SectionCard>
              </Grid>
            </Grid>
          );
        }}
      </SectionState>
    </>
  );
}
