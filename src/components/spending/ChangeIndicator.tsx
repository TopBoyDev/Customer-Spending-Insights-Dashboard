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
 * Direction is conveyed by an arrow and words. Colour stays neutral on purpose:
 * spending more is not inherently bad, so we avoid red/green judgement.
 */
export function ChangeIndicator({
  change,
  size = 'body2',
}: {
  change: ChangeDescription;
  size?: 'body1' | 'body2';
}) {
  const Icon = ICONS[change.direction];
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
      <Icon aria-hidden sx={{ fontSize: size === 'body1' ? 20 : 16, color: 'primary.main' }} />
      <Typography variant={size} color="text.secondary">
        {change.text}
      </Typography>
    </Stack>
  );
}
