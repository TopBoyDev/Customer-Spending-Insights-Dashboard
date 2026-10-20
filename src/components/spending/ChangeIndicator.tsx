import ArrowDownwardRounded from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRounded from '@mui/icons-material/ArrowUpwardRounded';
import HorizontalRuleRounded from '@mui/icons-material/HorizontalRuleRounded';
import { Stack, Typography } from '@mui/material';
import type { ChangeDescription } from '../../utils/insights';

const ICONS = {
  up: ArrowUpwardRounded,
  down: ArrowDownwardRounded,
  flat: HorizontalRuleRounded,
  none: HorizontalRuleRounded,
} as const;

/**
 * Direction is conveyed by an arrow and words in neutral colour: spending more
 * is not inherently bad, so there is no red/green judgement.
 */
export function ChangeIndicator({ change }: { change: ChangeDescription }) {
  const Icon = ICONS[change.direction];
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
      <Icon aria-hidden sx={{ fontSize: 16 }} />
      <Typography variant="caption" component="span">
        {change.text}
      </Typography>
    </Stack>
  );
}
