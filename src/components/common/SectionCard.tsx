import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { useId, type ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  id?: string;
}

/** A labelled dashboard region with a consistent heading structure. */
export function SectionCard({ title, subtitle, action, children, id }: SectionCardProps) {
  const headingId = useId();
  return (
    <Card
      component="section"
      aria-labelledby={headingId}
      id={id}
      // Keeps the heading clear of the sticky header when scrolled into view.
      sx={{ height: '100%', scrollMarginTop: { xs: 160, md: 96 } }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ mb: 2, justifyContent: 'space-between', alignItems: { sm: 'flex-start' } }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h2"
              id={headingId}
              tabIndex={-1}
              sx={{ '&:focus': { outline: 'none' } }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}
