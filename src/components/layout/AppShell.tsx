import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined';
import DonutLargeOutlined from '@mui/icons-material/DonutLargeOutlined';
import GridViewOutlined from '@mui/icons-material/GridViewOutlined';
import ReceiptLongOutlined from '@mui/icons-material/ReceiptLongOutlined';
import ShowChartRounded from '@mui/icons-material/ShowChartRounded';
import {
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  ButtonBase,
  Paper,
  Stack,
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
  overview: GridViewOutlined,
  categories: DonutLargeOutlined,
  trends: ShowChartRounded,
  transactions: ReceiptLongOutlined,
  budgets: AccountBalanceWalletOutlined,
};

export const MAIN_ID = 'main-content';
export const SIDEBAR_WIDTH = 248;

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
          width: 34,
          height: 34,
          borderRadius: '10px',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <ShowChartRounded sx={{ fontSize: 21 }} />
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

function CustomerAvatar({ name }: { name: string }) {
  return (
    <Avatar
      aria-hidden
      sx={{
        width: 36,
        height: 36,
        fontSize: '0.8125rem',
        fontWeight: 600,
        bgcolor: tokens.color.accentSoft,
        color: 'primary.main',
      }}
    >
      {initials(name)}
    </Avatar>
  );
}

function SidebarCustomer() {
  const profile = useCustomerProfile();
  const meta = useApiMeta();
  if (!profile.data) return null;
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
      <CustomerAvatar name={profile.data.name} />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
          {profile.data.name}
        </Typography>
        {meta.data && (
          <Typography variant="caption" component="p" noWrap>
            Data to {formatCalendarDate(meta.data.dataAsOf)}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

function Sidebar({ view, hrefFor, onNavigate }: Omit<AppShellProps, 'children'>) {
  return (
    <Box
      component="aside"
      sx={{
        position: 'fixed',
        inset: '0 auto 0 0',
        width: SIDEBAR_WIDTH,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
        px: 2,
        py: 3,
      }}
    >
      <Box sx={{ px: 1, mb: 4 }}>
        <Brand />
      </Box>
      <Box component="nav" aria-label="Dashboard sections" sx={{ flex: 1 }}>
        <Stack component="ul" spacing={0.5} sx={{ m: 0, p: 0, listStyle: 'none' }}>
          {VIEWS.map((item) => {
            const Icon = VIEW_ICON[item];
            const selected = item === view;
            return (
              <li key={item}>
                <ButtonBase
                  component="a"
                  href={hrefFor(item)}
                  aria-current={selected ? 'page' : undefined}
                  onClick={(event: MouseEvent) => handleLinkClick(event, () => onNavigate(item))}
                  sx={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    gap: 1.5,
                    px: 1.5,
                    py: 1.25,
                    borderRadius: '10px',
                    fontSize: '0.875rem',
                    fontWeight: selected ? 600 : 500,
                    color: selected ? 'primary.main' : 'text.secondary',
                    bgcolor: selected ? tokens.color.accentSoft : 'transparent',
                    transition: 'background-color 120ms, color 120ms',
                    '&:hover': {
                      bgcolor: selected ? tokens.color.accentSoft : tokens.color.surfaceMuted,
                      color: selected ? 'primary.main' : 'text.primary',
                    },
                  }}
                >
                  <Icon aria-hidden sx={{ fontSize: 20 }} />
                  {VIEW_LABEL[item]}
                </ButtonBase>
              </li>
            );
          })}
        </Stack>
      </Box>
      <Box sx={{ px: 1, pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <SidebarCustomer />
      </Box>
    </Box>
  );
}

function MobileTopBar() {
  const profile = useCustomerProfile();
  return (
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
        px: 2,
      }}
    >
      <Stack
        direction="row"
        sx={{ height: 56, alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Brand />
        {profile.data && <CustomerAvatar name={profile.data.name} />}
      </Stack>
    </Box>
  );
}

function BottomBar({ view, hrefFor, onNavigate }: Omit<AppShellProps, 'children'>) {
  return (
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
  );
}

/**
 * App frame: a fixed sidebar menu on desktop, and a compact top bar with a
 * bottom tab bar on phones. Each section is a real link, so it can be opened
 * in a new browser tab or bookmarked.
 */
export function AppShell({ view, hrefFor, onNavigate, children }: AppShellProps) {
  const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));

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

      {isDesktop ? (
        <Sidebar view={view} hrefFor={hrefFor} onNavigate={onNavigate} />
      ) : (
        <MobileTopBar />
      )}

      <Box
        component="main"
        id={MAIN_ID}
        tabIndex={-1}
        sx={{
          ml: { md: `${SIDEBAR_WIDTH}px` },
          px: { xs: 2, sm: 3, md: 5, lg: 6 },
          pt: { xs: 3, md: 5 },
          pb: { xs: 12, md: 8 },
          outline: 'none',
        }}
      >
        <Box sx={{ maxWidth: 1180, mx: 'auto' }}>{children}</Box>
      </Box>

      {!isDesktop && <BottomBar view={view} hrefFor={hrefFor} onNavigate={onNavigate} />}
    </Box>
  );
}
