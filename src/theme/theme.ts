import { alpha, createTheme } from '@mui/material/styles';

/**
 * Design tokens. Surfaces are separated by soft shadows rather than borders.
 * Capitec blue is the single accent: the sidebar, the hero metric, selected
 * controls and the primary data series. Category colours from the API appear
 * only as chart marks and small dots; status colours only as small markers.
 *
 * All text colours meet WCAG 2.2 AA (4.5:1) against the surfaces they sit on.
 */
export const tokens = {
  color: {
    accent: '#004973',
    accentDark: '#00344F',
    accentLight: '#2B7DAA',
    accentSoft: '#E6EFF5',
    background: '#F2F4F7',
    surface: '#FFFFFF',
    surfaceMuted: '#F4F6F8',
    border: '#E8EBEF',
    textPrimary: '#101828',
    textSecondary: '#5D6679',
    textTertiary: '#6B7385',
    onAccent: '#FFFFFF',
    onAccentMuted: 'rgba(255, 255, 255, 0.74)',
    success: '#15803D',
    warning: '#B45309',
    error: '#B42318',
    chartMuted: '#B9CEDB',
    track: '#EDF0F3',
  },
  radius: { card: 20, control: 12, pill: 999 },
  shadow: {
    card: '0 1px 2px rgba(16, 24, 40, 0.04), 0 8px 24px -6px rgba(16, 24, 40, 0.08)',
    raised: '0 2px 4px rgba(16, 24, 40, 0.05), 0 16px 40px -8px rgba(16, 24, 40, 0.14)',
    accent: '0 12px 32px -10px rgba(0, 73, 115, 0.55)',
    control: '0 1px 2px rgba(16, 24, 40, 0.06), 0 2px 6px rgba(16, 24, 40, 0.06)',
  },
  gradient: {
    accent: 'linear-gradient(150deg, #00598A 0%, #004973 45%, #00344F 100%)',
  },
  /** Card padding, in theme spacing units (8px), used by every card. */
  cardPadding: { xs: 2.5, sm: 3 },
} as const;

const fontFamily = [
  '"Inter Variable"',
  'Inter',
  'system-ui',
  '-apple-system',
  '"Segoe UI"',
  'Roboto',
  'Arial',
  'sans-serif',
].join(',');

const { color } = tokens;

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: color.accent, dark: color.accentDark, contrastText: color.onAccent },
    success: { main: color.success },
    warning: { main: color.warning },
    error: { main: color.error },
    background: { default: color.background, paper: color.surface },
    text: { primary: color.textPrimary, secondary: color.textSecondary },
    divider: color.border,
  },
  shape: { borderRadius: tokens.radius.control },
  typography: {
    fontFamily,
    h1: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2 },
    h2: { fontSize: '1rem', fontWeight: 650, letterSpacing: '-0.01em', lineHeight: 1.4 },
    h3: { fontSize: '0.9375rem', fontWeight: 600, lineHeight: 1.4 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 600, fontSize: '0.875rem' },
    body2: { fontSize: '0.875rem' },
    caption: { fontSize: '0.8125rem', color: color.textSecondary },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      letterSpacing: '0.06em',
      lineHeight: 1.5,
      color: color.textSecondary,
    },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          fontFeatureSettings: '"tnum" 1, "cv11" 1',
        },
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '0.01ms !important',
            transitionDuration: '0.01ms !important',
          },
        },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: 0,
          borderRadius: tokens.radius.card,
          boxShadow: tokens.shadow.card,
        },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          '&.Mui-focusVisible': {
            outline: `2px solid ${color.accentLight}`,
            outlineOffset: 2,
          },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: tokens.radius.control } },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          backgroundColor: color.surface,
          borderRadius: tokens.radius.control,
          boxShadow: tokens.shadow.control,
          padding: 4,
          gap: 4,
        },
        grouped: {
          border: 0,
          borderRadius: `${tokens.radius.control - 4}px !important`,
          margin: 0,
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          minHeight: 34,
          paddingInline: 14,
          fontWeight: 600,
          fontSize: '0.8125rem',
          color: color.textSecondary,
          '&:hover': { backgroundColor: color.surfaceMuted },
          '&.Mui-selected, &.Mui-selected:hover': {
            color: color.onAccent,
            backgroundColor: color.accent,
          },
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          minWidth: 0,
          paddingInline: 4,
          color: color.textTertiary,
          '&.Mui-selected': { color: color.accent },
        },
        label: {
          fontSize: '0.6875rem',
          fontWeight: 600,
          '&.Mui-selected': { fontSize: '0.6875rem' },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: color.border },
        head: {
          fontWeight: 600,
          fontSize: '0.75rem',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: color.textSecondary,
          whiteSpace: 'nowrap',
          borderBottom: 0,
          backgroundColor: color.surfaceMuted,
          '&:first-of-type': { borderTopLeftRadius: 10, borderBottomLeftRadius: 10 },
          '&:last-of-type': { borderTopRightRadius: 10, borderBottomRightRadius: 10 },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { height: 8, borderRadius: 4, backgroundColor: color.track },
        bar: { borderRadius: 4 },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: tokens.radius.pill, fontWeight: 500 } },
    },
    MuiAlert: { styleOverrides: { root: { borderRadius: tokens.radius.control } } },
    MuiSkeleton: { styleOverrides: { root: { backgroundColor: color.surfaceMuted } } },
    MuiMenu: {
      styleOverrides: {
        paper: {
          marginTop: 6,
          borderRadius: tokens.radius.control,
          boxShadow: tokens.shadow.raised,
        },
        list: { padding: 6 },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontSize: '0.875rem',
          minHeight: 38,
          '&.Mui-selected': {
            backgroundColor: color.accentSoft,
            color: color.accent,
            fontWeight: 600,
          },
          '&.Mui-selected:hover': { backgroundColor: alpha(color.accent, 0.12) },
        },
      },
    },
  },
});
