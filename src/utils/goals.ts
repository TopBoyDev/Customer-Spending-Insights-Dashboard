import type { GoalStatus, SpendingGoal } from '../../shared/types';
import { tokens } from '../theme/theme';

/** Marker colour per status; the words come from the message catalogue. */
export const GOAL_STATUS_COLOR: Record<GoalStatus, string> = {
  on_track: tokens.color.success,
  warning: tokens.color.warning,
  exceeded: tokens.color.error,
};

/** Progress bars use the brand accent; only an exceeded budget turns red. */
export function budgetBarColor(goal: SpendingGoal): string {
  return goal.status === 'exceeded' ? tokens.color.error : tokens.color.accent;
}
