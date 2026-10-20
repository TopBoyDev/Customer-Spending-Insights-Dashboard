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
import type { Messages } from '../i18n/en';
import { useMessages } from '../i18n/I18nProvider';
import { StatusLabel } from '../components/common/StatusLabel';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState, SectionState } from '../components/states/SectionState';
import { useApiMeta, useSpendingGoals } from '../hooks/useInsightsQueries';
import { tokens } from '../theme/theme';
import { formatCurrency, formatMonthLong, formatPercent } from '../utils/format';
import { budgetBarColor } from '../utils/goals';

function guidance(goal: SpendingGoal, remaining: number, m: Messages): string {
  if (remaining < 0) return m.budgets.overBy(formatCurrency(Math.abs(remaining)));
  if (goal.daysRemaining === 0) return m.budgets.left(formatCurrency(remaining));
  const perDay = remaining / goal.daysRemaining;
  return m.budgets.leftPerDay(formatCurrency(remaining), formatCurrency(perDay));
}

export function GoalCard({ goal }: { goal: SpendingGoal }) {
  const m = useMessages();
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
            {m.budgets.monthlyBudget(formatCurrency(goal.monthlyBudget))}
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
        aria-label={m.budgets.budgetUsed(goal.category)}
        aria-valuetext={m.budgets.usedOf(
          formatPercent(goal.percentageUsed),
          formatCurrency(goal.monthlyBudget),
        )}
        sx={{ '& .MuiLinearProgress-bar': { bgcolor: budgetBarColor(goal) } }}
      />
      <Typography variant="caption" component="p" sx={{ mt: 1 }}>
        {guidance(goal, remaining, m)}
      </Typography>
    </Card>
  );
}

function Totals({ goals }: { goals: SpendingGoal[] }) {
  const m = useMessages();
  const budget = goals.reduce((sum, goal) => sum + goal.monthlyBudget, 0);
  const spent = goals.reduce((sum, goal) => sum + goal.currentSpent, 0);
  const remaining = budget - spent;
  const daysRemaining = goals[0]?.daysRemaining;
  return (
    <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 2, md: 3 } }}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <StatCard
          icon={<AccountBalanceWalletOutlined />}
          label={m.budgets.totalBudgeted}
          value={formatCurrency(budget)}
          footnote={m.budgets.categoryCount(goals.length)}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <StatCard
          icon={<PaymentsOutlined />}
          label={m.budgets.spentSoFar}
          value={formatCurrency(spent)}
          footnote={m.budgets.ofBudget(formatPercent(budget === 0 ? 0 : (spent / budget) * 100))}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <StatCard
          icon={<SavingsOutlined />}
          label={remaining >= 0 ? m.budgets.remaining : m.budgets.overBudget}
          value={formatCurrency(Math.abs(remaining))}
          footnote={daysRemaining === undefined ? undefined : m.budgets.daysLeft(daysRemaining)}
        />
      </Grid>
    </Grid>
  );
}

export function BudgetsView() {
  const m = useMessages();
  const query = useSpendingGoals();
  const meta = useApiMeta();
  const month = meta.data ? formatMonthLong(toMonthKey(meta.data.dataAsOf)) : m.budgets.thisMonth;
  const days = query.data?.goals[0]?.daysRemaining;

  return (
    <>
      <PageHeader
        title={m.views.budgets}
        description={
          days === undefined ? month : m.budgets.monthWithDays(month, m.budgets.daysLeft(days))
        }
      />
      <SectionState
        query={query}
        loadingLabel={m.budgets.loading}
        skeleton={
          <Grid container spacing={2.5}>
            {[0, 1, 2, 3].map((key) => (
              <Grid key={key} size={{ xs: 12, md: 6 }}>
                <Skeleton variant="rounded" height={170} />
              </Grid>
            ))}
          </Grid>
        }
        errorTitle={m.budgets.error}
        isEmpty={(data) => data.goals.length === 0}
        empty={<EmptyState title={m.budgets.empty} />}
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
