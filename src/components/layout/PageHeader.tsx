import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export const PAGE_HEADING_ID = 'page-heading';

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}

/**
 * Title row for each tab. The heading receives focus after a tab change so
 * keyboard and screen-reader users land at the start of the new view.
 */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      sx={{ mb: { xs: 2, md: 3 }, justifyContent: 'space-between', alignItems: { md: 'flex-end' } }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="h1"
          id={PAGE_HEADING_ID}
          tabIndex={-1}
          sx={{ '&:focus': { outline: 'none' } }}
        >
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" component="p" sx={{ mt: 0.5 }}>
            {description}
          </Typography>
        )}
      </Box>
      {actions && <Box sx={{ flexShrink: 0 }}>{actions}</Box>}
    </Stack>
  );
}
