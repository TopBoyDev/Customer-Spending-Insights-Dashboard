import { Box, Skeleton, Stack, Typography } from '@mui/material';
import type { Period, SpendingByCategory } from '../../../shared/types';
import { useSpendingCategories } from '../../hooks/useInsightsQueries';
import { formatCurrency, formatDateRange, formatPercent, PERIOD_LABEL } from '../../utils/format';
import { CategoryDot } from '../common/CategoryDot';
import { SectionCard } from '../common/SectionCard';
import { EmptyState, SectionState } from '../states/SectionState';

/** One 100% bar showing each category's share; the legend below is its text equivalent. */
export function ProportionBar({ data }: { data: SpendingByCategory }) {
  return (
    <Box
      aria-hidden
      sx={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', gap: '2px' }}
    >
      {data.categories.map((category) => (
        <Box
          key={category.name}
          sx={{ flexGrow: category.amount, flexBasis: 0, minWidth: 3, bgcolor: category.color }}
        />
      ))}
    </Box>
  );
}

export function CategorySnapshot({ period, onMore }: { period: Period; onMore: () => void }) {
  const query = useSpendingCategories(period);
  return (
    <SectionCard
      title="Categories"
      subtitle={
        query.data
          ? formatDateRange(query.data.dateRange.startDate, query.data.dateRange.endDate)
          : `The ${PERIOD_LABEL[period]}`
      }
      more={{ label: 'View categories', onClick: onMore }}
    >
      <SectionState
        query={query}
        loadingLabel="Loading spending by category"
        skeleton={
          <Stack spacing={1.5}>
            <Skeleton variant="rounded" height={10} />
            {[0, 1, 2, 3].map((key) => (
              <Skeleton key={key} variant="text" />
            ))}
          </Stack>
        }
        errorTitle="Category spending could not be loaded"
        isEmpty={(data) => data.categories.length === 0}
        empty={<EmptyState title={`No spending in the ${PERIOD_LABEL[period]}`} />}
      >
        {(data) => (
          <Stack spacing={2}>
            <ProportionBar data={data} />
            <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
              {data.categories.map((category) => (
                <Stack
                  key={category.name}
                  component="li"
                  direction="row"
                  spacing={1.25}
                  sx={{ alignItems: 'center', py: 0.875 }}
                >
                  <CategoryDot color={category.color} />
                  <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }} noWrap>
                    {category.name}
                  </Typography>
                  <Typography variant="caption" sx={{ width: 48, textAlign: 'right' }}>
                    {formatPercent(category.percentage)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, minWidth: 96, textAlign: 'right' }}
                  >
                    {formatCurrency(category.amount)}
                  </Typography>
                </Stack>
              ))}
            </Box>
          </Stack>
        )}
      </SectionState>
    </SectionCard>
  );
}
