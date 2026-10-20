import { Box, LinearProgress, Skeleton, Stack, Typography } from '@mui/material';
import { toMonthKey } from '../../../shared/dates';
import type { SpendingGoal } from '../../../shared/types';
import { useApiMeta, useSpendingGoals } from '../../hooks/useInsightsQueries';
import { formatCurrency, formatMonthLong, formatPercent } from '../../utils/format';
import { budgetBarColor } from '../../utils/goals';
import { SectionCard } from '../common/SectionCard';
import { StatusLabel } from '../common/StatusLabel';
import { EmptyState, SectionState } from '../states/SectionState';

function BudgetRow({ goal }: { goal: SpendingGoal }) {
  return (
    <Box component="li" sx={{ listStyle: 'none', py: 1.25 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.75 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, minWidth: 0 }} noWrap>
          {goal.category}
        </Typography>
        <StatusLabel status={goal.status} />
      </Stack>
      <LinearProgress
        variant="determinate"
        value={Math.min(goal.percentageUsed, 100)}
        aria-label={`${goal.category} budget used`}
        aria-valuetext={`${formatPercent(goal.percentageUsed)} of ${formatCurrency(goal.monthlyBudget)} used`}
        sx={{ '& .MuiLinearProgress-bar': { bgcolor: budgetBarColor(goal) } }}
      />
      <Typography variant="caption" component="p" sx={{ mt: 0.5 }}>
        {formatCurrency(goal.currentSpent)} of {formatCurrency(goal.monthlyBudget)}
      </Typography>
    </Box>
  );
}

export function BudgetSnapshot({ onMore }: { onMore: () => void }) {
  const query = useSpendingGoals();
  const meta = useApiMeta();
  const month = meta.data ? formatMonthLong(toMonthKey(meta.data.dataAsOf)) : 'This month';
  const days = query.data?.goals[0]?.daysRemaining;

  return (
    <SectionCard
      title="Monthly budgets"
      subtitle={
        days === undefined ? month : `${month} · ${days} ${days === 1 ? 'day' : 'days'} left`
      }
      more={{ label: 'budgets', onClick: onMore }}
    >
      <SectionState
        query={query}
        loadingLabel="Loading monthly budgets"
        skeleton={
          <Stack spacing={2}>
            {[0, 1, 2].map((key) => (
              <Skeleton key={key} variant="rounded" height={44} />
            ))}
          </Stack>
        }
        errorTitle="Your budgets could not be loaded"
        isEmpty={(data) => data.goals.length === 0}
        empty={<EmptyState title="No monthly budgets set" />}
      >
        {(data) => (
          <Box component="ul" sx={{ m: 0, p: 0, mt: -1.25 }}>
            {data.goals.map((goal) => (
              <BudgetRow key={goal.id} goal={goal} />
            ))}
          </Box>
        )}
      </SectionState>
    </SectionCard>
  );
}
