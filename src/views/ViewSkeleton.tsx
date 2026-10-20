import { Grid2 as Grid, Skeleton, Stack } from '@mui/material';
import { tokens } from '../theme/theme';

const cardSx = { borderRadius: `${tokens.radius.card}px` };

/** Placeholder while a code-split view loads; mirrors the page header and card grid. */
export function ViewSkeleton() {
  return (
    <Stack spacing={3} role="status" aria-label="Loading">
      <Skeleton variant="text" width={180} height={44} />
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {[0, 1, 2].map((key) => (
          <Grid key={key} size={{ xs: 12, sm: 4 }}>
            <Skeleton variant="rounded" height={150} sx={cardSx} />
          </Grid>
        ))}
        <Grid size={12}>
          <Skeleton variant="rounded" height={320} sx={cardSx} />
        </Grid>
      </Grid>
    </Stack>
  );
}
