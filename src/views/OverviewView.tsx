import { Grid2 as Grid } from '@mui/material';
import type { Period } from '../../shared/types';
import { PeriodSelector } from '../components/dashboard/PeriodSelector';
import { PageHeader } from '../components/layout/PageHeader';
import { BudgetSnapshot } from '../components/overview/BudgetSnapshot';
import { CategorySnapshot } from '../components/overview/CategorySnapshot';
import { RecentTransactions } from '../components/overview/RecentTransactions';
import { SummaryCard } from '../components/overview/SummaryCard';
import { TrendSnapshot } from '../components/overview/TrendSnapshot';
import type { View } from '../navigation';

interface OverviewViewProps {
  period: Period;
  onPeriodChange: (period: Period) => void;
  onNavigate: (view: View) => void;
}

/** At-a-glance dashboard. Each card summarises one area and links to its full tab. */
export function OverviewView({ period, onPeriodChange, onNavigate }: OverviewViewProps) {
  return (
    <>
      <PageHeader
        title="Overview"
        actions={<PeriodSelector value={period} onChange={onPeriodChange} />}
      />
      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid size={12}>
          <SummaryCard period={period} />
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <CategorySnapshot period={period} onMore={() => onNavigate('categories')} />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <BudgetSnapshot onMore={() => onNavigate('budgets')} />
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <TrendSnapshot onMore={() => onNavigate('trends')} />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <RecentTransactions period={period} onMore={() => onNavigate('transactions')} />
        </Grid>
      </Grid>
    </>
  );
}
