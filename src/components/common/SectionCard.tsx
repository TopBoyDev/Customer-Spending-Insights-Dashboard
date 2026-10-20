import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import { Box, Button, Card, Stack, Typography } from '@mui/material';
import { useId, type ReactNode } from 'react';
import { useMessages } from '../../i18n/I18nProvider';
import { tokens } from '../../theme/theme';

interface SectionCardProps {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  /** Link to the section with the full detail; `label` names the destination for screen readers. */
  more?: { label: string; onClick: () => void };
  children: ReactNode;
  id?: string;
}

/** A labelled dashboard region: elevated surface, consistent padding and header. */
export function SectionCard({ title, subtitle, action, more, children, id }: SectionCardProps) {
  const m = useMessages();
  const headingId = useId();
  return (
    <Card
      component="section"
      aria-labelledby={headingId}
      id={id}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: tokens.cardPadding }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 2.5, justifyContent: 'space-between', alignItems: 'flex-start' }}
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
        {more && (
          <Button
            size="small"
            onClick={more.onClick}
            aria-label={m.common.viewAllLabel(more.label)}
            endIcon={<ArrowForwardRounded aria-hidden sx={{ fontSize: '16px !important' }} />}
            sx={{
              flexShrink: 0,
              mt: -0.5,
              mr: -1,
              px: 1.25,
              color: 'primary.main',
              fontSize: '0.8125rem',
              '&:hover': { bgcolor: tokens.color.accentSoft },
            }}
          >
            {m.common.viewAll}
          </Button>
        )}
      </Stack>
      <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
    </Card>
  );
}
