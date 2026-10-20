import type { GoalStatus, SpendingGoal } from '../../shared/types';
import { tokens } from '../theme/theme';

export const GOAL_STATUS: Record<GoalStatus, { label: string; color: string }> = {
  on_track: { label: 'On track', color: tokens.color.success },
  warning: { label: 'Nearing limit', color: tokens.color.warning },
  exceeded: { label: 'Over budget', color: tokens.color.error },
};

/** Progress bars stay in the neutral ink colour; only an exceeded budget turns red. */
export function budgetBarColor(goal: SpendingGoal): string {
  return goal.status === 'exceeded' ? tokens.color.error : tokens.color.textPrimary;
}
