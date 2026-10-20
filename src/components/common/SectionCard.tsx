import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import { Box, Button, Card, Stack, Typography } from '@mui/material';
import { useId, type ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  /** Link to the tab with the full detail for this card. */
  more?: { label: string; onClick: () => void };
  children: ReactNode;
  id?: string;
  /** Remove inner padding, e.g. for edge-to-edge tables. */
  flush?: boolean;
}

/** A labelled dashboard region with a consistent header and optional "view more" footer. */
export function SectionCard({
  title,
  subtitle,
  action,
  more,
  children,
  id,
  flush,
}: SectionCardProps) {
  const headingId = useId();
  return (
    <Card
      component="section"
      aria-labelledby={headingId}
      id={id}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{
          px: { xs: 2, sm: 2.5 },
          pt: { xs: 2, sm: 2.5 },
          pb: 2,
          justifyContent: 'space-between',
          alignItems: { sm: 'flex-start' },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h2" id={headingId}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" component="p" sx={{ mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
      </Stack>
      <Box sx={{ flex: 1, px: flush ? 0 : { xs: 2, sm: 2.5 }, pb: more ? 0 : { xs: 2, sm: 2.5 } }}>
        {children}
      </Box>
      {more && (
        <Box sx={{ px: { xs: 1, sm: 1.5 }, py: 1, borderTop: 1, borderColor: 'divider', mt: 2 }}>
          <Button
            size="small"
            onClick={more.onClick}
            endIcon={<ArrowForwardRounded aria-hidden />}
            sx={{ color: 'text.primary', px: 1 }}
          >
            {more.label}
          </Button>
        </Box>
      )}
    </Card>
  );
}
