import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import DonutLargeOutlined from '@mui/icons-material/DonutLargeOutlined';
import EventOutlined from '@mui/icons-material/EventOutlined';
import GridViewOutlined from '@mui/icons-material/GridViewOutlined';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import ReceiptLongOutlined from '@mui/icons-material/ReceiptLongOutlined';
import ShowChartRounded from '@mui/icons-material/ShowChartRounded';
import WorkspacePremiumRounded from '@mui/icons-material/WorkspacePremiumRounded';
import {
  Avatar,
  Box,
  ButtonBase,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  type PaletteMode,
  type SvgIconProps,
  type Theme,
} from '@mui/material';
import type { ComponentType, MouseEvent, ReactNode } from 'react';
import type { CustomerProfile } from '../../../shared/types';
import { useApiMeta, useCustomerProfile } from '../../hooks/useInsightsQueries';
import { VIEW_LABEL, VIEWS, type View } from '../../navigation';
import { useColorMode } from '../../theme/ColorModeProvider';
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

/** The sidebar and mobile header are always brand blue, in both colour modes. */
const BRAND_BLUE = '#004973';
const WHITE = '#FFFFFF';

/** Curated avatar gradients; one is picked deterministically from the customer's name. */
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
  'linear-gradient(135deg, #10B981 0%, #0EA5E9 100%)',
  'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
  'linear-gradient(135deg, #F97316 0%, #DB2777 100%)',
  'linear-gradient(135deg, #06B6D4 0%, #6366F1 100%)',
] as const;

export const MAIN_ID = 'main-content';
export const SIDEBAR_WIDTH = 252;
/** Gap between the floating sidebar and the viewport edge, in px. */
const SHELL_GAP = 16;

const onBlueFocus = { '&.Mui-focusVisible': { outline: `2px solid ${WHITE}`, outlineOffset: 1 } };

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

function avatarGradient(name: string): string {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length] ?? AVATAR_GRADIENTS[0];
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
          width: 36,
          height: 36,
          borderRadius: '11px',
          bgcolor: WHITE,
          color: BRAND_BLUE,
          display: 'grid',
          placeItems: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.18)',
        }}
      >
        <ShowChartRounded sx={{ fontSize: 22 }} />
      </Box>
      <Typography
        component="p"
        sx={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.015em', color: WHITE }}
      >
        Spending Insights
      </Typography>
    </Stack>
  );
}

function CustomerAvatar({ name, size = 42 }: { name: string; size?: number }) {
  return (
    <Avatar
      aria-hidden
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.34,
        fontWeight: 700,
        letterSpacing: '0.02em',
        color: WHITE,
        background: avatarGradient(name),
        boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.9), 0 6px 16px -4px rgba(0, 0, 0, 0.35)',
      }}
    >
      {initials(name)}
    </Avatar>
  );
}

function PremiumBadge() {
  return (
    <Stack
      direction="row"
      spacing={0.375}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 0.75,
        py: 0.125,
        borderRadius: tokens.radius.pill,
        background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)',
        color: '#3B2500',
      }}
    >
      <WorkspacePremiumRounded aria-hidden sx={{ fontSize: 12 }} />
      <Typography component="span" sx={{ fontSize: '0.6875rem', fontWeight: 700 }}>
        Premium
      </Typography>
    </Stack>
  );
}

function ProfileCard({ profile }: { profile: CustomerProfile }) {
  const meta = useApiMeta();
  return (
    <Box
      sx={{
        p: 1.75,
        borderRadius: '18px',
        bgcolor: 'rgba(255, 255, 255, 0.1)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.12)',
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
        <CustomerAvatar name={profile.name} />
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: WHITE, lineHeight: 1.3, mb: 0.375 }}
            noWrap
          >
            {profile.name}
          </Typography>
          {profile.accountType === 'premium' && <PremiumBadge />}
        </Box>
      </Stack>
      {meta.data && (
        <Tooltip title="Demo data is fixed to this date" placement="top">
          <Stack
            direction="row"
            spacing={0.75}
            tabIndex={0}
            sx={{
              alignItems: 'center',
              mt: 1.5,
              pt: 1.25,
              borderTop: '1px solid rgba(255, 255, 255, 0.12)',
              color: tokens.color.onAccentMuted,
              outline: 'none',
              '&:focus-visible': { outline: `2px solid ${WHITE}`, outlineOffset: 2 },
            }}
          >
            <EventOutlined aria-hidden sx={{ fontSize: 15 }} />
            <Typography component="span" sx={{ fontSize: '0.75rem', color: 'inherit' }}>
              Data to {formatCalendarDate(meta.data.dataAsOf)}
            </Typography>
          </Stack>
        </Tooltip>
      )}
    </Box>
  );
}

const MODE_OPTIONS: { mode: PaletteMode; label: string; Icon: ComponentType<SvgIconProps> }[] = [
  { mode: 'light', label: 'Light', Icon: LightModeOutlined },
  { mode: 'dark', label: 'Dark', Icon: DarkModeOutlined },
];

/** Two-option segmented switch for the colour theme, sized for the sidebar. */
function ThemeSwitch() {
  const { mode, setMode } = useColorMode();
  return (
    <Stack
      role="group"
      aria-label="Colour theme"
      direction="row"
      sx={{ p: 0.5, borderRadius: '14px', bgcolor: 'rgba(0, 0, 0, 0.18)' }}
    >
      {MODE_OPTIONS.map(({ mode: option, label, Icon }) => {
        const selected = option === mode;
        return (
          <ButtonBase
            key={option}
            aria-pressed={selected}
            onClick={() => setMode(option)}
            sx={{
              flex: 1,
              gap: 0.75,
              py: 0.875,
              borderRadius: '10px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: selected ? BRAND_BLUE : tokens.color.onAccentMuted,
              bgcolor: selected ? WHITE : 'transparent',
              boxShadow: selected ? '0 2px 6px rgba(0, 0, 0, 0.18)' : 'none',
              transition: 'background-color 150ms, color 150ms',
              '&:hover': { color: selected ? BRAND_BLUE : WHITE },
              ...onBlueFocus,
            }}
          >
            <Icon aria-hidden sx={{ fontSize: 17 }} />
            {label}
          </ButtonBase>
        );
      })}
    </Stack>
  );
}

function Sidebar({ view, hrefFor, onNavigate }: Omit<AppShellProps, 'children'>) {
  const profile = useCustomerProfile();
  return (
    <Box
      component="aside"
      sx={{
        position: 'fixed',
        top: SHELL_GAP,
        bottom: SHELL_GAP,
        left: SHELL_GAP,
        width: SIDEBAR_WIDTH,
        display: 'flex',
        flexDirection: 'column',
        background: tokens.gradient.accent,
        borderRadius: '24px',
        boxShadow: tokens.shadow.accent,
        px: 2,
        py: 3.5,
        overflowY: 'auto',
      }}
    >
      <Box sx={{ px: 1.5, mb: 5 }}>
        <Brand />
      </Box>
      <Box component="nav" aria-label="Dashboard sections" sx={{ flex: 1 }}>
        <Stack component="ul" spacing={0.75} sx={{ m: 0, p: 0, listStyle: 'none' }}>
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
                    px: 1.75,
                    py: 1.375,
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontWeight: selected ? 650 : 500,
                    color: selected ? WHITE : tokens.color.onAccentMuted,
                    bgcolor: selected ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
                    transition: 'background-color 150ms, color 150ms',
                    '&:hover': {
                      bgcolor: selected ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.08)',
                      color: WHITE,
                    },
                    ...onBlueFocus,
                  }}
                >
                  <Icon aria-hidden sx={{ fontSize: 21 }} />
                  {VIEW_LABEL[item]}
                </ButtonBase>
              </li>
            );
          })}
        </Stack>
      </Box>
      <Stack spacing={1.5}>
        <ThemeSwitch />
        {profile.data && <ProfileCard profile={profile.data} />}
      </Stack>
    </Box>
  );
}

function MobileTopBar() {
  const profile = useCustomerProfile();
  const { mode, setMode } = useColorMode();
  const nextMode: PaletteMode = mode === 'light' ? 'dark' : 'light';
  const toggleLabel = `Switch to ${nextMode} mode`;
  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        background: tokens.gradient.accent,
        boxShadow: '0 4px 16px -6px rgba(0, 52, 79, 0.45)',
        px: 2,
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ height: 60, alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Brand />
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
          <Tooltip title={toggleLabel}>
            <IconButton
              aria-label={toggleLabel}
              onClick={() => setMode(nextMode)}
              sx={{
                color: WHITE,
                bgcolor: 'rgba(255, 255, 255, 0.12)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                ...onBlueFocus,
              }}
            >
              {mode === 'light' ? (
                <DarkModeOutlined sx={{ fontSize: 20 }} />
              ) : (
                <LightModeOutlined sx={{ fontSize: 20 }} />
              )}
            </IconButton>
          </Tooltip>
          {profile.data && (
            <Tooltip title={profile.data.name}>
              <Box
                tabIndex={0}
                sx={{
                  borderRadius: '50%',
                  outline: 'none',
                  '&:focus-visible': { outline: `2px solid ${WHITE}`, outlineOffset: 3 },
                }}
              >
                <CustomerAvatar name={profile.data.name} size={34} />
                <Box component="span" sx={visuallyHiddenSx}>
                  {profile.data.name}
                </Box>
              </Box>
            </Tooltip>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

/** Floating tab bar for phones: the active tab gets a pill indicator behind its icon. */
function BottomBar({ view, hrefFor, onNavigate }: Omit<AppShellProps, 'children'>) {
  return (
    <Box
      component="nav"
      aria-label="Dashboard sections"
      sx={{
        position: 'fixed',
        left: 12,
        right: 12,
        bottom: 'calc(12px + env(safe-area-inset-bottom))',
        zIndex: (theme) => theme.zIndex.appBar,
        borderRadius: '24px',
        bgcolor: tokens.color.navSurface,
        backdropFilter: 'saturate(180%) blur(16px)',
        boxShadow: tokens.shadow.raised,
      }}
    >
      <Stack component="ul" direction="row" sx={{ m: 0, p: 0.75, listStyle: 'none' }}>
        {VIEWS.map((item) => {
          const Icon = VIEW_ICON[item];
          const selected = item === view;
          return (
            <Box component="li" key={item} sx={{ flex: 1, minWidth: 0 }}>
              <ButtonBase
                component="a"
                href={hrefFor(item)}
                aria-current={selected ? 'page' : undefined}
                onClick={(event: MouseEvent) => handleLinkClick(event, () => onNavigate(item))}
                sx={{
                  width: '100%',
                  flexDirection: 'column',
                  gap: 0.375,
                  py: 0.75,
                  borderRadius: '16px',
                  color: selected ? tokens.color.accentFg : tokens.color.textTertiary,
                  '&.Mui-focusVisible': {
                    outline: `2px solid ${tokens.color.accentLight}`,
                    outlineOffset: -2,
                  },
                }}
              >
                <Box
                  aria-hidden
                  sx={{
                    width: 52,
                    height: 30,
                    borderRadius: '15px',
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: selected ? tokens.color.accentSoft : 'transparent',
                    transition: 'background-color 200ms',
                  }}
                >
                  <Icon sx={{ fontSize: 22 }} />
                </Box>
                <Typography
                  component="span"
                  noWrap
                  sx={{
                    maxWidth: '100%',
                    fontSize: '0.6875rem',
                    fontWeight: selected ? 700 : 600,
                    color: selected ? tokens.color.accentFg : tokens.color.textSecondary,
                  }}
                >
                  {VIEW_LABEL[item]}
                </Typography>
              </ButtonBase>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}

/**
 * App frame: a floating brand-blue sidebar on desktop; a brand header and a
 * floating tab bar on phones. Each section is a real link, so it can be
 * opened in a new browser tab or bookmarked.
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
          ml: { md: `${SIDEBAR_WIDTH + SHELL_GAP}px` },
          px: { xs: 2, sm: 3, md: 4, lg: 5 },
          pt: { xs: 3, md: 4.5 },
          pb: { xs: 15, md: 8 },
          outline: 'none',
        }}
      >
        <Box sx={{ maxWidth: 1180, mx: 'auto' }}>{children}</Box>
      </Box>

      {!isDesktop && <BottomBar view={view} hrefFor={hrefFor} onNavigate={onNavigate} />}
    </Box>
  );
}
