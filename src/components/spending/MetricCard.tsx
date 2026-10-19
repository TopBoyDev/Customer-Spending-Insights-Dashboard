import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: ReactNode;
  supporting?: ReactNode;
}

/** A secondary metric, visually subordinate to the headline total. */
export function MetricCard({ label, value, supporting }: MetricCardProps) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.default',
        height: '100%',
        minWidth: 0,
      }}
    >
      <Typography component="p" variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        component="p"
        variant="h3"
        sx={{ m: 0, mt: 0.5, fontSize: '1.25rem', overflowWrap: 'anywhere' }}
      >
        {value}
      </Typography>
      {supporting && <Box sx={{ mt: 0.5 }}>{supporting}</Box>}
    </Box>
  );
}
