import { Box, LinearProgress, Skeleton, Stack, Typography } from '@mui/material';
import { toMonthKey } from '../../../shared/dates';
import type { SpendingGoal } from '../../../shared/types';
import { useApiMeta, useSpendingGoals } from '../../hooks/useInsightsQueries';
import { formatCurrency, formatMonthLong, formatPercent } from '../../utils/format';
import { budgetBarColor } from '../../utils/goals';
import { useMessages } from '../../i18n/I18nProvider';
import { SectionCard } from '../common/SectionCard';
import { StatusLabel } from '../common/StatusLabel';
import { EmptyState, SectionState } from '../states/SectionState';

function BudgetRow({ goal }: { goal: SpendingGoal }) {
  const m = useMessages();
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
        aria-label={m.budgets.budgetUsed(goal.category)}
        aria-valuetext={m.budgets.usedOf(
          formatPercent(goal.percentageUsed),
          formatCurrency(goal.monthlyBudget),
        )}
        sx={{ '& .MuiLinearProgress-bar': { bgcolor: budgetBarColor(goal) } }}
      />
      <Typography variant="caption" component="p" sx={{ mt: 0.5 }}>
        {m.budgets.spentOf(formatCurrency(goal.currentSpent), formatCurrency(goal.monthlyBudget))}
      </Typography>
    </Box>
  );
}

export function BudgetSnapshot({ onMore }: { onMore: () => void }) {
  const m = useMessages();
  const query = useSpendingGoals();
  const meta = useApiMeta();
  const month = meta.data ? formatMonthLong(toMonthKey(meta.data.dataAsOf)) : m.budgets.thisMonth;
  const days = query.data?.goals[0]?.daysRemaining;

  return (
    <SectionCard
      title={m.budgets.snapshotTitle}
      subtitle={
        days === undefined ? month : m.budgets.monthWithDays(month, m.budgets.daysLeft(days))
      }
      more={{ label: m.budgets.viewAll, onClick: onMore }}
    >
      <SectionState
        query={query}
        loadingLabel={m.budgets.loading}
        skeleton={
          <Stack spacing={2}>
            {[0, 1, 2].map((key) => (
              <Skeleton key={key} variant="rounded" height={44} />
            ))}
          </Stack>
        }
        errorTitle={m.budgets.error}
        isEmpty={(data) => data.goals.length === 0}
        empty={<EmptyState title={m.budgets.empty} />}
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
