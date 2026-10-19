import CheckCircleOutlineRounded from '@mui/icons-material/CheckCircleOutlineRounded';
import ErrorOutlineRounded from '@mui/icons-material/ErrorOutlineRounded';
import WarningAmberRounded from '@mui/icons-material/WarningAmberRounded';
import { Box, Chip, LinearProgress, Skeleton, Stack, Typography } from '@mui/material';
import { CATEGORY_BY_NAME } from '../../../shared/categories';
import { toMonthKey } from '../../../shared/dates';
import type { GoalStatus, SpendingGoal } from '../../../shared/types';
import { useApiMeta, useSpendingGoals } from '../../hooks/useInsightsQueries';
import { tokens } from '../../theme/theme';
import { formatCurrency, formatMonthLong, formatPercent } from '../../utils/format';
import { CategoryIcon } from '../common/CategoryIcon';
import { SectionCard } from '../common/SectionCard';
import { EmptyState, SectionState } from '../states/SectionState';

const STATUS: Record<
  GoalStatus,
  { label: string; icon: typeof CheckCircleOutlineRounded; color: string; background: string }
> = {
  on_track: {
    label: 'On track',
    icon: CheckCircleOutlineRounded,
    color: tokens.color.success,
    background: tokens.color.successSoft,
  },
  warning: {
    label: 'Nearing limit',
    icon: WarningAmberRounded,
    color: tokens.color.warning,
    background: tokens.color.warningSoft,
  },
  exceeded: {
    label: 'Over budget',
    icon: ErrorOutlineRounded,
    color: tokens.color.error,
    background: tokens.color.errorSoft,
  },
};

export function GoalCard({ goal }: { goal: SpendingGoal }) {
  const category = CATEGORY_BY_NAME[goal.category];
  const status = STATUS[goal.status];
  const StatusIcon = status.icon;
  const remaining = goal.monthlyBudget - goal.currentSpent;

  return (
    <Box
      component="li"
      sx={{ listStyle: 'none', p: 2, borderRadius: 2, bgcolor: 'background.default' }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
        <CategoryIcon icon={category.icon} color={category.color} size={32} />
        <Typography
          variant="subtitle1"
          component="h3"
          sx={{ flex: 1, minWidth: 0, fontWeight: 600 }}
        >
          {goal.category}
        </Typography>
        <Chip
          size="small"
          icon={<StatusIcon aria-hidden />}
          label={status.label}
          sx={{
            color: status.color,
            bgcolor: status.background,
            fontWeight: 600,
            '& .MuiChip-icon': { color: status.color },
          }}
        />
      </Stack>
      <LinearProgress
        variant="determinate"
        value={Math.min(goal.percentageUsed, 100)}
        aria-label={`${goal.category} budget used`}
        aria-valuetext={`${formatPercent(goal.percentageUsed)} of ${formatCurrency(goal.monthlyBudget)} used`}
        sx={{ bgcolor: 'divider', '& .MuiLinearProgress-bar': { bgcolor: status.color } }}
      />
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{ justifyContent: 'space-between', flexWrap: 'wrap', mt: 1 }}
      >
        <Typography variant="body2">
          <strong>{formatCurrency(goal.currentSpent)}</strong>{' '}
          <Box component="span" sx={{ color: 'text.secondary' }}>
            of {formatCurrency(goal.monthlyBudget)} ({formatPercent(goal.percentageUsed)})
          </Box>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {remaining >= 0
            ? `${formatCurrency(remaining)} left`
            : `${formatCurrency(Math.abs(remaining))} over`}
        </Typography>
      </Stack>
    </Box>
  );
}

export function SpendingGoals() {
  const query = useSpendingGoals();
  const meta = useApiMeta();
  const monthLabel = meta.data ? formatMonthLong(toMonthKey(meta.data.dataAsOf)) : 'This month';
  const daysRemaining = query.data?.goals[0]?.daysRemaining;

  return (
    <SectionCard
      title="Monthly budgets"
      subtitle={
        <>
          {monthLabel} to date
          {daysRemaining !== undefined &&
            ` · ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} left in the month`}
        </>
      }
    >
      <SectionState
        query={query}
        loadingLabel="Loading monthly budgets"
        skeleton={
          <Stack spacing={1.5}>
            {[0, 1, 2].map((key) => (
              <Skeleton key={key} variant="rounded" height={104} />
            ))}
          </Stack>
        }
        errorTitle="Your budgets could not be loaded"
        isEmpty={(data) => data.goals.length === 0}
        empty={<EmptyState title="No monthly budgets set" />}
      >
        {(data) => (
          <Stack spacing={1.5}>
            <Stack component="ul" spacing={1.5} sx={{ m: 0, p: 0 }}>
              {data.goals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Budgets track this calendar month only, regardless of the period selected above.
            </Typography>
          </Stack>
        )}
      </SectionState>
    </SectionCard>
  );
}
