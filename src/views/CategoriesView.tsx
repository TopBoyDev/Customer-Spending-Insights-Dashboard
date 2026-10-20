import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import { Box, ButtonBase, Grid2 as Grid, Skeleton, Stack, Typography } from '@mui/material';
import { lazy, Suspense } from 'react';
import type { CategoryName } from '../../shared/categories';
import type { CategorySpending, Period } from '../../shared/types';
import { CategoryDot } from '../components/common/CategoryDot';
import { SectionCard } from '../components/common/SectionCard';
import { PeriodSelector } from '../components/dashboard/PeriodSelector';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState, SectionState } from '../components/states/SectionState';
import { useSpendingCategories } from '../hooks/useInsightsQueries';
import { tokens } from '../theme/theme';
import { formatCurrency, formatDateRange, formatNumber, formatPercent } from '../utils/format';
import { useMessages } from '../i18n/I18nProvider';

function CategoryRow({
  category,
  maxPercentage,
  onSelect,
}: {
  category: CategorySpending;
  maxPercentage: number;
  onSelect: () => void;
}) {
  const m = useMessages();
  const transactionLabel = m.transactions.count(
    category.transactionCount,
    formatNumber(category.transactionCount),
  );
  return (
    <ButtonBase
      onClick={onSelect}
      aria-label={m.categories.rowLabel(
        category.name,
        formatCurrency(category.amount),
        formatPercent(category.percentage),
        transactionLabel,
      )}
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
          <Typography variant="caption">
            {m.categories.ofTotal(formatPercent(category.percentage))}
          </Typography>
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

const CategoryDonut = lazy(() => import('../components/charts/CategoryDonut'));

export function CategoriesView({ period, onPeriodChange, onSelectCategory }: CategoriesViewProps) {
  const m = useMessages();
  const query = useSpendingCategories(period);
  const range = query.data
    ? formatDateRange(query.data.dateRange.startDate, query.data.dateRange.endDate)
    : null;

  return (
    <>
      <PageHeader
        title={m.views.categories}
        actions={<PeriodSelector value={period} onChange={onPeriodChange} />}
      />
      <SectionState
        query={query}
        loadingLabel={m.categories.loading}
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
        errorTitle={m.categories.error}
        isEmpty={(data) => data.categories.length === 0}
        empty={
          <EmptyState
            title={m.states.noSpendingIn(m.period.last[period])}
            description={m.categories.emptyHint}
          />
        }
      >
        {(data) => {
          const maxPercentage = Math.max(0, ...data.categories.map((c) => c.percentage));
          return (
            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid size={{ xs: 12, md: 5 }}>
                <SectionCard title={m.categories.share} subtitle={range}>
                  <Stack spacing={2.5} sx={{ alignItems: 'center' }}>
                    <Suspense fallback={<Skeleton variant="circular" width={240} height={240} />}>
                      <CategoryDonut data={data} />
                    </Suspense>
                  </Stack>
                </SectionCard>
              </Grid>
              <Grid size={{ xs: 12, md: 7 }}>
                <SectionCard title={m.categories.breakdown}>
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
