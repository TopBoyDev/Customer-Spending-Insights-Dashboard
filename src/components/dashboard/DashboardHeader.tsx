import InsightsOutlined from '@mui/icons-material/InsightsOutlined';
import { Box, Chip, Container, Skeleton, Stack, Typography } from '@mui/material';
import type { Period } from '../../../shared/types';
import { useApiMeta, useCustomerProfile } from '../../hooks/useInsightsQueries';
import { formatCalendarDate } from '../../utils/format';
import { PeriodSelector } from './PeriodSelector';

interface DashboardHeaderProps {
  period: Period;
  onPeriodChange: (period: Period) => void;
}

function firstName(fullName: string): string {
  return fullName.split(' ')[0] ?? fullName;
}

export function DashboardHeader({ period, onPeriodChange }: DashboardHeaderProps) {
  const profile = useCustomerProfile();
  const meta = useApiMeta();

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        bgcolor: 'rgba(244, 246, 250, 0.92)',
        backdropFilter: 'blur(8px)',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 1.5, sm: 2 } }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 1.5, md: 3 }}
          sx={{ justifyContent: 'space-between', alignItems: { md: 'center' } }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
            <Box
              aria-hidden
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <InsightsOutlined />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h1">Spending Insights</Typography>
              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                sx={{ alignItems: 'center', flexWrap: 'wrap', mt: 0.25 }}
              >
                <Typography variant="body2" color="text.secondary" component="p">
                  {profile.data ? (
                    `Hi ${firstName(profile.data.name)}, here is where your money went.`
                  ) : profile.isError ? (
                    'Here is where your money went.'
                  ) : (
                    <Skeleton width={220} component="span" sx={{ display: 'inline-block' }} />
                  )}
                </Typography>
                {meta.data && (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`Demo data to ${formatCalendarDate(meta.data.dataAsOf)}`}
                  />
                )}
              </Stack>
            </Box>
          </Stack>
          <PeriodSelector value={period} onChange={onPeriodChange} />
        </Stack>
      </Container>
    </Box>
  );
}
