import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined';
import PaymentsOutlined from '@mui/icons-material/PaymentsOutlined';
import SavingsOutlined from '@mui/icons-material/SavingsOutlined';
import {
  Box,
  Card,
  Grid2 as Grid,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { CATEGORY_BY_NAME } from '../../shared/categories';
import { toMonthKey } from '../../shared/dates';
import type { SpendingGoal } from '../../shared/types';
import { CategoryDot } from '../components/common/CategoryDot';
import { CategoryIcon } from '../components/common/CategoryIcon';
import { StatCard } from '../components/common/StatCard';
import { StatusLabel } from '../components/common/StatusLabel';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState, SectionState } from '../components/states/SectionState';
import { useApiMeta, useSpendingGoals } from '../hooks/useInsightsQueries';
import { tokens } from '../theme/theme';
import { formatCurrency, formatMonthLong, formatPercent } from '../utils/format';
import { budgetBarColor } from '../utils/goals';

function guidance(goal: SpendingGoal, remaining: number): string {
  if (remaining < 0) return `${formatCurrency(Math.abs(remaining))} over budget`;
  if (goal.daysRemaining === 0) return `${formatCurrency(remaining)} left`;
  const perDay = remaining / goal.daysRemaining;
  return `${formatCurrency(remaining)} left · about ${formatCurrency(perDay)} a day`;
}

export function GoalCard({ goal }: { goal: SpendingGoal }) {
  const category = CATEGORY_BY_NAME[goal.category];
  const remaining = goal.monthlyBudget - goal.currentSpent;

  return (
    <Card sx={{ p: tokens.cardPadding, height: '100%' }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <CategoryIcon icon={category.icon} size={36} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <CategoryDot color={category.color} />
            <Typography variant="h3" component="h2" noWrap>
              {goal.category}
            </Typography>
          </Stack>
          <Typography variant="caption" component="p">
            Monthly budget {formatCurrency(goal.monthlyBudget)}
          </Typography>
        </Box>
        <StatusLabel status={goal.status} />
      </Stack>

      <Stack
        direction="row"
        sx={{ alignItems: 'baseline', justifyContent: 'space-between', mt: 2.5, mb: 1 }}
      >
        <Typography sx={{ fontSize: '1.375rem', fontWeight: 650, letterSpacing: '-0.02em' }}>
          {formatCurrency(goal.currentSpent)}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {formatPercent(goal.percentageUsed)}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={Math.min(goal.percentageUsed, 100)}
        aria-label={`${goal.category} budget used`}
        aria-valuetext={`${formatPercent(goal.percentageUsed)} of ${formatCurrency(goal.monthlyBudget)} used`}
        sx={{ '& .MuiLinearProgress-bar': { bgcolor: budgetBarColor(goal) } }}
      />
      <Typography variant="caption" component="p" sx={{ mt: 1 }}>
        {guidance(goal, remaining)}
      </Typography>
    </Card>
  );
}

function Totals({ goals }: { goals: SpendingGoal[] }) {
  const budget = goals.reduce((sum, goal) => sum + goal.monthlyBudget, 0);
  const spent = goals.reduce((sum, goal) => sum + goal.currentSpent, 0);
  const remaining = budget - spent;
  const daysRemaining = goals[0]?.daysRemaining;
  return (
    <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 2, md: 3 } }}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <StatCard
          icon={<AccountBalanceWalletOutlined />}
          label="Total budgeted"
          value={formatCurrency(budget)}
          footnote={`${goals.length} ${goals.length === 1 ? 'category' : 'categories'}`}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <StatCard
          icon={<PaymentsOutlined />}
          label="Spent so far"
          value={formatCurrency(spent)}
          footnote={`${formatPercent(budget === 0 ? 0 : (spent / budget) * 100)} of budget`}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <StatCard
          icon={<SavingsOutlined />}
          label={remaining >= 0 ? 'Remaining' : 'Over budget'}
          value={formatCurrency(Math.abs(remaining))}
          footnote={
            daysRemaining === undefined
              ? undefined
              : `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} left in the month`
          }
        />
      </Grid>
    </Grid>
  );
}

export function BudgetsView() {
  const query = useSpendingGoals();
  const meta = useApiMeta();
  const month = meta.data ? formatMonthLong(toMonthKey(meta.data.dataAsOf)) : 'This month';
  const days = query.data?.goals[0]?.daysRemaining;

  return (
    <>
      <PageHeader
        title="Budgets"
        description={
          days === undefined ? month : `${month} · ${days} ${days === 1 ? 'day' : 'days'} left`
        }
      />
      <SectionState
        query={query}
        loadingLabel="Loading monthly budgets"
        skeleton={
          <Grid container spacing={2.5}>
            {[0, 1, 2, 3].map((key) => (
              <Grid key={key} size={{ xs: 12, md: 6 }}>
                <Skeleton variant="rounded" height={170} />
              </Grid>
            ))}
          </Grid>
        }
        errorTitle="Your budgets could not be loaded"
        isEmpty={(data) => data.goals.length === 0}
        empty={<EmptyState title="No monthly budgets set" />}
      >
        {(data) => (
          <>
            <Totals goals={data.goals} />
            <Grid component="ul" container spacing={{ xs: 2, md: 3 }} sx={{ m: 0, p: 0 }}>
              {data.goals.map((goal) => (
                <Grid
                  key={goal.id}
                  component="li"
                  size={{ xs: 12, md: 6 }}
                  sx={{ listStyle: 'none' }}
                >
                  <GoalCard goal={goal} />
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </SectionState>
    </>
  );
}
