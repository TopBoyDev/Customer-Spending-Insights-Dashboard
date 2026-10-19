import type { CategoryName } from '../categories';

/**
 * - `on_track`: below 80% of the monthly budget
 * - `warning`: 80% to 100% of the monthly budget
 * - `exceeded`: more than 100% of the monthly budget (documented extension)
 */
export type GoalStatus = 'on_track' | 'warning' | 'exceeded';

export const GOAL_WARNING_THRESHOLD = 80;
export const GOAL_EXCEEDED_THRESHOLD = 100;

export interface SpendingGoal {
  id: string;
  category: CategoryName;
  monthlyBudget: number;
  /** Month-to-date spending for the category. */
  currentSpent: number;
  percentageUsed: number;
  /** Calendar days left in the month after the data reference date. */
  daysRemaining: number;
  status: GoalStatus;
}

/** GET /api/customers/{customerId}/goals */
export interface SpendingGoals {
  goals: SpendingGoal[];
}
