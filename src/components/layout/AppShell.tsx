import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined';
import CategoryOutlined from '@mui/icons-material/CategoryOutlined';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import ReceiptLongOutlined from '@mui/icons-material/ReceiptLongOutlined';
import ShowChartRounded from '@mui/icons-material/ShowChartRounded';
import {
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Container,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  type SvgIconProps,
  type Theme,
} from '@mui/material';
import type { ComponentType, MouseEvent, ReactNode } from 'react';
import { useApiMeta, useCustomerProfile } from '../../hooks/useInsightsQueries';
import { VIEW_LABEL, VIEWS, type View } from '../../navigation';
import { tokens } from '../../theme/theme';
import { visuallyHiddenSx } from '../../utils/a11y';
import { formatCalendarDate } from '../../utils/format';

const VIEW_ICON: Record<View, ComponentType<SvgIconProps>> = {
  overview: DashboardOutlined,
  categories: CategoryOutlined,
  trends: ShowChartRounded,
  transactions: ReceiptLongOutlined,
  budgets: AccountBalanceWalletOutlined,
};

export const MAIN_ID = 'main-content';

interface AppShellProps {
  view: View;
  hrefFor: (view: View) => string;
  onNavigate: (view: View) => void;
  children: ReactNode;
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/** Plain left-clicks navigate in-app; modified clicks keep native link behaviour (new tab). */
function handleLinkClick(event: MouseEvent, navigate: () => void) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }
  event.preventDefault();
  navigate();
}

function Brand() {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
      <Box
        aria-hidden
        sx={{
          width: 32,
          height: 32,
          borderRadius: '9px',
          bgcolor: 'text.primary',
          color: '#FFFFFF',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <ShowChartRounded sx={{ fontSize: 20 }} />
      </Box>
      <Typography
        component="p"
        sx={{ fontWeight: 650, fontSize: '0.9375rem', letterSpacing: '-0.01em' }}
      >
        Spending Insights
      </Typography>
    </Stack>
  );
}

function CustomerBadge() {
  const profile = useCustomerProfile();
  const meta = useApiMeta();
  if (!profile.data) return null;
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
      <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
          {profile.data.name}
        </Typography>
        {meta.data && (
          <Typography variant="caption" component="p" sx={{ lineHeight: 1.3 }}>
            Demo data to {formatCalendarDate(meta.data.dataAsOf)}
          </Typography>
        )}
      </Box>
      <Avatar
        aria-hidden
        sx={{
          width: 34,
          height: 34,
          fontSize: '0.8125rem',
          fontWeight: 600,
          bgcolor: tokens.color.surfaceMuted,
          color: 'text.primary',
          border: 1,
          borderColor: 'divider',
        }}
      >
        {initials(profile.data.name)}
      </Avatar>
    </Stack>
  );
}

/**
 * App frame: sticky top bar with section tabs on wide screens, and a fixed
 * bottom tab bar on phones (the familiar banking-app pattern). Each tab is a
 * real link, so it can be opened in a new browser tab or bookmarked.
 */
export function AppShell({ view, hrefFor, onNavigate, children }: AppShellProps) {
  const isCompact = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        component="a"
        href={`#${MAIN_ID}`}
        sx={{
          ...visuallyHiddenSx,
          '&:focus': {
            position: 'fixed',
            top: 8,
            left: 8,
            width: 'auto',
            height: 'auto',
            clip: 'auto',
            margin: 0,
            px: 2,
            py: 1.25,
            zIndex: 2000,
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderRadius: 1,
            boxShadow: 3,
          },
        }}
      >
        Skip to main content
      </Box>

      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: (theme) => theme.zIndex.appBar,
          bgcolor: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'saturate(180%) blur(12px)',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction="row"
            sx={{ height: 60, alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Brand />
            <CustomerBadge />
          </Stack>
          {!isCompact && (
            <Box component="nav" aria-label="Dashboard sections" sx={{ mt: -0.5 }}>
              <Tabs value={view} aria-label="Dashboard sections">
                {VIEWS.map((item) => (
                  <Tab
                    key={item}
                    value={item}
                    label={VIEW_LABEL[item]}
                    component="a"
                    href={hrefFor(item)}
                    aria-current={item === view ? 'page' : undefined}
                    onClick={(event: MouseEvent) => handleLinkClick(event, () => onNavigate(item))}
                  />
                ))}
              </Tabs>
            </Box>
          )}
        </Container>
      </Box>

      <Container
        component="main"
        id={MAIN_ID}
        tabIndex={-1}
        maxWidth="lg"
        sx={{ pt: { xs: 2.5, md: 4 }, pb: { xs: 12, md: 6 }, outline: 'none' }}
      >
        {children}
        <Typography variant="caption" component="p" sx={{ mt: 6, textAlign: 'center' }}>
          Concept demonstration for a take-home assessment. Not an official banking product. All
          customers, merchants and transactions are fictional.
        </Typography>
      </Container>

      {isCompact && (
        <Paper
          component="nav"
          aria-label="Dashboard sections"
          square
          elevation={0}
          sx={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: (theme) => theme.zIndex.appBar,
            borderTop: 1,
            borderColor: 'divider',
            pb: 'env(safe-area-inset-bottom)',
          }}
        >
          <BottomNavigation value={view} showLabels sx={{ height: 64 }}>
            {VIEWS.map((item) => {
              const Icon = VIEW_ICON[item];
              return (
                <BottomNavigationAction
                  key={item}
                  value={item}
                  label={VIEW_LABEL[item]}
                  icon={<Icon aria-hidden />}
                  component="a"
                  href={hrefFor(item)}
                  aria-current={item === view ? 'page' : undefined}
                  onClick={(event: MouseEvent) => handleLinkClick(event, () => onNavigate(item))}
                />
              );
            })}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}
