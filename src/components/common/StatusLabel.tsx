import { Stack, Tooltip, Typography } from '@mui/material';
import type { GoalStatus } from '../../../shared/types';
import { tokens } from '../../theme/theme';
import { GOAL_STATUS } from '../../utils/goals';
import { CategoryDot } from './CategoryDot';

const STATUS_HELP: Record<GoalStatus, string> = {
  on_track: 'Less than 80% of the monthly budget used',
  warning: '80% to 100% of the monthly budget used',
  exceeded: 'More than the monthly budget has been spent',
};

/** Status in words with a small coloured marker; colour never carries meaning alone. */
export function StatusLabel({ status }: { status: GoalStatus }) {
  const { label, color } = GOAL_STATUS[status];
  return (
    <Tooltip title={STATUS_HELP[status]} describeChild>
      <Stack
        direction="row"
        spacing={0.75}
        tabIndex={0}
        sx={{
          alignItems: 'center',
          flexShrink: 0,
          borderRadius: 1,
          outline: 'none',
          cursor: 'help',
          '&:focus-visible': { outline: `2px solid ${tokens.color.accentLight}`, outlineOffset: 2 },
        }}
      >
        <CategoryDot color={color} size={6} />
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {label}
        </Typography>
      </Stack>
    </Tooltip>
  );
}
