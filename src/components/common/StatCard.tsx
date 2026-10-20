import ArrowDownwardRounded from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRounded from '@mui/icons-material/ArrowUpwardRounded';
import { Box, Card, Stack, Tooltip, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { tokens } from '../../theme/theme';
import { formatPercent } from '../../utils/format';

/**
 * Compact percentage-change badge. Deliberately neutral in colour: more
 * spending or more transactions is not inherently good or bad.
 */
export function ChangeBadge({ change, label }: { change: number; label: string }) {
  const Icon = change >= 0 ? ArrowUpwardRounded : ArrowDownwardRounded;
  return (
    <Tooltip title={label}>
      <Stack
        direction="row"
        spacing={0.25}
        aria-label={label}
        role="img"
        tabIndex={0}
        sx={{
          outline: 'none',
          '&:focus-visible': { outline: `2px solid ${tokens.color.accentLight}`, outlineOffset: 2 },
          alignItems: 'center',
          flexShrink: 0,
          px: 0.875,
          py: 0.25,
          borderRadius: tokens.radius.pill,
          bgcolor: tokens.color.accentSoft,
          color: tokens.color.accentFg,
        }}
      >
        <Icon aria-hidden sx={{ fontSize: 14 }} />
        <Typography component="span" sx={{ fontSize: '0.75rem', fontWeight: 700 }}>
          {formatPercent(Math.abs(change))}
        </Typography>
      </Stack>
    </Tooltip>
  );
}

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  /** Short context shown at the bottom, e.g. "vs previous 7 days". */
  footnote?: ReactNode;
  /** Optional badge shown before the footnote. */
  badge?: ReactNode;
}

/**
 * A single metric with a fixed anatomy so cards in a row always line up:
 * label + icon, value, then a footer pinned to the bottom.
 */
export function StatCard({ icon, label, value, footnote, badge }: StatCardProps) {
  return (
    <Card sx={{ height: '100%', p: tokens.cardPadding, display: 'flex', flexDirection: 'column' }}>
      {/* On phones the icon sits above the label so half-width cards never truncate it. */}
      <Stack
        sx={{
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          gap: 1.5,
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <Typography
          variant="body2"
          component="p"
          noWrap
          sx={{ color: 'text.secondary', pt: 0.5, minWidth: 0 }}
        >
          {label}
        </Typography>
        <Box
          aria-hidden
          sx={{
            width: 36,
            height: 36,
            flexShrink: 0,
            borderRadius: '11px',
            display: 'grid',
            placeItems: 'center',
            bgcolor: tokens.color.accentSoft,
            color: 'primary.main',
            '& .MuiSvgIcon-root': { fontSize: 19 },
          }}
        >
          {icon}
        </Box>
      </Stack>
      <Typography
        component="p"
        noWrap
        sx={{
          fontSize: { xs: '1.375rem', sm: '1.5rem' },
          fontWeight: 700,
          letterSpacing: '-0.025em',
          lineHeight: 1.2,
          mt: 0.5,
          mb: 2,
        }}
      >
        {value}
      </Typography>
      <Stack
        direction="row"
        useFlexGap
        sx={{ mt: 'auto', minHeight: 22, gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}
      >
        {badge}
        {footnote && (
          <Typography variant="caption" component="p" sx={{ minWidth: 0 }}>
            {footnote}
          </Typography>
        )}
      </Stack>
    </Card>
  );
}
