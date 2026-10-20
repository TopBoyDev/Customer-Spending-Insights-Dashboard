import { Box } from '@mui/material';

/** The only place a category's colour appears outside charts. Always paired with text. */
export function CategoryDot({ color, size = 8 }: { color: string; size?: number }) {
  return (
    <Box
      component="span"
      aria-hidden
      sx={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        bgcolor: color,
        flexShrink: 0,
      }}
    />
  );
}
