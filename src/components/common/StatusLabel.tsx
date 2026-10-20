import { Stack, Tooltip, Typography } from '@mui/material';
import type { GoalStatus } from '../../../shared/types';
import { tokens } from '../../theme/theme';
import { useMessages } from '../../i18n/I18nProvider';
import { GOAL_STATUS_COLOR } from '../../utils/goals';
import { CategoryDot } from './CategoryDot';

/** Status in words with a small coloured marker; colour never carries meaning alone. */
export function StatusLabel({ status }: { status: GoalStatus }) {
  const m = useMessages();
  return (
    <Tooltip title={m.budgets.statusHelp[status]} describeChild>
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
        <CategoryDot color={GOAL_STATUS_COLOR[status]} size={6} />
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {m.budgets.status[status]}
        </Typography>
      </Stack>
    </Tooltip>
  );
}
