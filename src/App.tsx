import { Box, Container, Grid2 as Grid, Link, Typography } from '@mui/material';
import { useCallback } from 'react';
import type { CategoryName } from '../shared/categories';
import { DashboardHeader } from './components/dashboard/DashboardHeader';
import { SpendingGoals } from './components/goals/SpendingGoals';
import { CategoryBreakdown } from './components/spending/CategoryBreakdown';
import { SpendingSummary } from './components/spending/SpendingSummary';
import { SpendingTrend } from './components/spending/SpendingTrend';
import { TRANSACTIONS_SECTION_ID, Transactions } from './components/transactions/Transactions';
import { useDashboardFilters } from './hooks/useDashboardFilters';
import { visuallyHiddenSx } from './utils/a11y';

const MAIN_ID = 'main-content';

export function App() {
  const { filters, update } = useDashboardFilters();

  const showCategoryTransactions = useCallback(
    (category: CategoryName) => {
      update({ category });
      const section = document.getElementById(TRANSACTIONS_SECTION_ID);
      if (section) {
        const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        section.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        // Move focus so keyboard and screen-reader users land on the result.
        section.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
      }
    },
    [update],
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Link
        href={`#${MAIN_ID}`}
        sx={{
          ...visuallyHiddenSx,
          '&:focus': {
            position: 'fixed',
            top: 8,
            left: 8,
            width: 'auto',
            height: 'auto',
            clip: 'auto',
            margin: 0,
            p: 1.5,
            zIndex: 2000,
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 3,
          },
        }}
      >
        Skip to main content
      </Link>

      <DashboardHeader period={filters.period} onPeriodChange={(period) => update({ period })} />

      <Container
        component="main"
        id={MAIN_ID}
        tabIndex={-1}
        maxWidth="lg"
        sx={{ py: { xs: 2, sm: 3 }, outline: 'none' }}
      >
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid size={12}>
            <SpendingSummary period={filters.period} />
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <CategoryBreakdown
              period={filters.period}
              onSelectCategory={showCategoryTransactions}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <SpendingGoals />
          </Grid>
          <Grid size={12}>
            <SpendingTrend
              months={filters.months}
              onMonthsChange={(months) => update({ months })}
            />
          </Grid>
          <Grid size={12}>
            <Transactions
              period={filters.period}
              category={filters.category}
              sortBy={filters.sortBy}
              page={filters.page}
              onChange={update}
            />
          </Grid>
        </Grid>
      </Container>

      <Box component="footer" sx={{ py: 4, px: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary" component="p">
          Concept demonstration for a take-home assessment. Not an official banking product. All
          customers, merchants and transactions shown are fictional.
        </Typography>
      </Box>
    </Box>
  );
}
