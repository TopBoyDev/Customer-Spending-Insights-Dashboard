import { Box, Card, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { tokens } from '../../theme/theme';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  supporting?: ReactNode;
}

/** A single metric: icon tile, label, value and an optional supporting line. */
export function StatCard({ icon, label, value, supporting }: StatCardProps) {
  return (
    <Card sx={{ height: '100%', p: tokens.cardPadding }}>
      <Box
        aria-hidden
        sx={{
          width: { xs: 36, sm: 40 },
          height: { xs: 36, sm: 40 },
          borderRadius: '12px',
          display: 'grid',
          placeItems: 'center',
          bgcolor: tokens.color.accentSoft,
          color: 'primary.main',
          mb: { xs: 1.5, sm: 2 },
          '& .MuiSvgIcon-root': { fontSize: 21 },
        }}
      >
        {icon}
      </Box>
      <Typography variant="caption" component="p">
        {label}
      </Typography>
      <Typography
        component="p"
        noWrap
        sx={{
          fontSize: { xs: '1.125rem', sm: '1.25rem' },
          fontWeight: 700,
          letterSpacing: '-0.02em',
          mt: 0.25,
        }}
      >
        {value}
      </Typography>
      {supporting && (
        <Box sx={{ mt: 0.75, color: 'text.secondary', fontSize: '0.8125rem' }}>{supporting}</Box>
      )}
    </Card>
  );
}
