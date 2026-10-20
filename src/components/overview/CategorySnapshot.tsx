import { Box, Skeleton, Stack, Tooltip, Typography } from '@mui/material';
import type { Period, SpendingByCategory } from '../../../shared/types';
import { useSpendingCategories } from '../../hooks/useInsightsQueries';
import { useMessages } from '../../i18n/I18nProvider';
import { formatCurrency, formatDateRange, formatPercent } from '../../utils/format';
import { CategoryDot } from '../common/CategoryDot';
import { SectionCard } from '../common/SectionCard';
import { EmptyState, SectionState } from '../states/SectionState';

/**
 * One 100% bar showing each category's share; hovering a segment shows its
 * figures. Hidden from assistive tech: the legend below is its text equivalent.
 */
export function ProportionBar({ data }: { data: SpendingByCategory }) {
  return (
    <Box
      aria-hidden
      sx={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', gap: '3px' }}
    >
      {data.categories.map((category) => (
        <Tooltip
          key={category.name}
          title={`${category.name} · ${formatCurrency(category.amount)} · ${formatPercent(category.percentage)}`}
        >
          <Box
            sx={{
              flexGrow: category.amount,
              flexBasis: 0,
              minWidth: 3,
              bgcolor: category.color,
              transition: 'opacity 150ms',
              '&:hover': { opacity: 0.8 },
            }}
          />
        </Tooltip>
      ))}
    </Box>
  );
}

export function CategorySnapshot({ period, onMore }: { period: Period; onMore: () => void }) {
  const m = useMessages();
  const query = useSpendingCategories(period);
  return (
    <SectionCard
      title={m.categories.title}
      subtitle={
        query.data
          ? formatDateRange(query.data.dateRange.startDate, query.data.dateRange.endDate)
          : undefined
      }
      more={{ label: m.categories.viewAll, onClick: onMore }}
    >
      <SectionState
        query={query}
        loadingLabel={m.categories.loading}
        skeleton={
          <Stack spacing={1.5}>
            <Skeleton variant="rounded" height={10} />
            {[0, 1, 2, 3].map((key) => (
              <Skeleton key={key} variant="text" />
            ))}
          </Stack>
        }
        errorTitle={m.categories.error}
        isEmpty={(data) => data.categories.length === 0}
        empty={<EmptyState title={m.states.noSpendingIn(m.period.last[period])} />}
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
