import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import {
  Box,
  ButtonBase,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { CategoryName } from '../../../shared/categories';
import type { CategorySpending, Period, SpendingByCategory } from '../../../shared/types';
import { useSpendingCategories } from '../../hooks/useInsightsQueries';
import {
  formatCurrency,
  formatDateRange,
  formatNumber,
  formatPercent,
  PERIOD_LABEL,
} from '../../utils/format';
import { CategoryIcon } from '../common/CategoryIcon';
import { SectionCard } from '../common/SectionCard';
import { EmptyState, SectionState } from '../states/SectionState';

interface CategoryBreakdownProps {
  period: Period;
  onSelectCategory: (category: CategoryName) => void;
}

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
      sx={{ position: 'relative', width: '100%', maxWidth: 240, height: 220, mx: 'auto' }}
    >
      {/* The labelled wrapper and the category list are the accessible equivalent. */}
      <Box aria-hidden sx={{ width: '100%', height: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.categories}
              dataKey="amount"
              nameKey="name"
              innerRadius="64%"
              outerRadius="96%"
              paddingAngle={1.5}
              stroke="#FFFFFF"
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
              contentStyle={{ borderRadius: 8 }}
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
        <Typography variant="caption" color="text.secondary">
          Total
        </Typography>
        <Typography sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
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
        p: 1.25,
        display: 'flex',
        gap: 1.5,
        alignItems: 'center',
        '&:hover': { bgcolor: 'background.default' },
      }}
    >
      <CategoryIcon icon={category.icon} color={category.color} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
          <Typography variant="subtitle2" noWrap>
            {category.name}
          </Typography>
          <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap' }}>
            {formatCurrency(category.amount)}
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          aria-hidden
          value={maxPercentage === 0 ? 0 : (category.percentage / maxPercentage) * 100}
          sx={{
            my: 0.75,
            height: 6,
            bgcolor: 'background.default',
            '& .MuiLinearProgress-bar': { bgcolor: category.color },
          }}
        />
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            {transactionLabel}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatPercent(category.percentage)}
          </Typography>
        </Stack>
      </Box>
      <ChevronRightRounded aria-hidden sx={{ color: 'text.secondary' }} />
    </ButtonBase>
  );
}

function CategorySkeleton() {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center' }}>
      <Skeleton variant="circular" width={200} height={200} />
      {[0, 1, 2, 3].map((key) => (
        <Skeleton key={key} variant="rounded" height={52} width="100%" />
      ))}
    </Stack>
  );
}

export function CategoryBreakdown({ period, onSelectCategory }: CategoryBreakdownProps) {
  const query = useSpendingCategories(period);
  const maxPercentage = Math.max(0, ...(query.data?.categories.map((c) => c.percentage) ?? []));

  return (
    <SectionCard
      title="Spending by category"
      subtitle={
        query.data
          ? formatDateRange(query.data.dateRange.startDate, query.data.dateRange.endDate)
          : `The ${PERIOD_LABEL[period]}`
      }
    >
      <SectionState
        query={query}
        loadingLabel="Loading spending by category"
        skeleton={<CategorySkeleton />}
        errorTitle="Category spending could not be loaded"
        isEmpty={(data) => data.categories.length === 0}
        empty={
          <EmptyState
            title={`No spending in the ${PERIOD_LABEL[period]}`}
            description="Categories appear here once you have transactions in this period."
          />
        }
      >
        {(data) => (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 2, sm: 3 }}
            sx={{ alignItems: { sm: 'center' } }}
          >
            <Box sx={{ flexShrink: 0, width: { xs: '100%', sm: 220 } }}>
              <CategoryDonut data={data} />
            </Box>
            <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" color="text.secondary">
                Select a category to see its transactions.
              </Typography>
              <Stack component="ul" spacing={0.5} sx={{ listStyle: 'none', m: 0, p: 0 }}>
                {data.categories.map((category) => (
                  <li key={category.name}>
                    <CategoryRow
                      category={category}
                      maxPercentage={maxPercentage}
                      onSelect={() => onSelectCategory(category.name)}
                    />
                  </li>
                ))}
              </Stack>
            </Stack>
          </Stack>
        )}
      </SectionState>
    </SectionCard>
  );
}
