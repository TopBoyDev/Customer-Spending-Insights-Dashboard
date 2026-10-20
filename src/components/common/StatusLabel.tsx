import { Stack, Typography } from '@mui/material';
import type { GoalStatus } from '../../../shared/types';
import { GOAL_STATUS } from '../../utils/goals';
import { CategoryDot } from './CategoryDot';

/** Status in words with a small coloured marker; colour never carries meaning alone. */
export function StatusLabel({ status }: { status: GoalStatus }) {
  const { label, color } = GOAL_STATUS[status];
  return (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexShrink: 0 }}>
      <CategoryDot color={color} size={6} />
      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
        {label}
      </Typography>
    </Stack>
  );
}
