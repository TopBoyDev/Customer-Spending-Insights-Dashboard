import { alpha, createTheme } from '@mui/material/styles';

/**
 * Design tokens. A neutral, mostly monochrome system with a single blue accent
 * reserved for interaction (selected tabs, links, focus) and the primary data
 * series. Semantic colours appear only as small status markers. Category
 * colours from the API are used solely for chart marks and small dots.
 *
 * All text colours meet WCAG 2.2 AA (4.5:1) against both surfaces.
 */
export const tokens = {
  color: {
    accent: '#1F4FD1',
    accentDark: '#173DA6',
    accentSoft: '#EEF2FD',
    background: '#F6F7F9',
    surface: '#FFFFFF',
    surfaceMuted: '#F3F4F6',
    border: '#E5E7EB',
    borderStrong: '#D1D5DB',
    textPrimary: '#111827',
    textSecondary: '#5B6475',
    textTertiary: '#6B7280',
    success: '#15803D',
    warning: '#B45309',
    error: '#B42318',
    chartMuted: '#C7D2F4',
    track: '#EDEFF2',
  },
  radius: { card: 16, control: 10, pill: 999 },
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
    primary: { main: color.accent, dark: color.accentDark, contrastText: '#FFFFFF' },
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
    h1: { fontSize: '1.5rem', fontWeight: 650, letterSpacing: '-0.02em', lineHeight: 1.25 },
    h2: { fontSize: '1rem', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.4 },
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
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: { borderColor: color.border, borderRadius: tokens.radius.card },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          '&.Mui-focusVisible': {
            outline: `2px solid ${color.accent}`,
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
          backgroundColor: color.surfaceMuted,
          borderRadius: tokens.radius.control,
          padding: 3,
          gap: 2,
        },
        grouped: {
          border: 0,
          borderRadius: `${tokens.radius.control - 3}px !important`,
          margin: 0,
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          minHeight: 34,
          paddingInline: 12,
          fontWeight: 600,
          fontSize: '0.8125rem',
          color: color.textSecondary,
          '&:hover': { backgroundColor: alpha(color.textPrimary, 0.04) },
          '&.Mui-selected, &.Mui-selected:hover': {
            color: color.textPrimary,
            backgroundColor: color.surface,
            boxShadow: '0 1px 2px rgba(17, 24, 39, 0.08), 0 0 0 1px rgba(17, 24, 39, 0.04)',
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 48,
          minWidth: 0,
          paddingInline: 4,
          marginRight: 24,
          fontWeight: 600,
          fontSize: '0.875rem',
          color: color.textSecondary,
          '&.Mui-selected': { color: color.textPrimary },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 48 },
        indicator: { height: 2, borderRadius: 2, backgroundColor: color.textPrimary },
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
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { height: 6, borderRadius: 3, backgroundColor: color.track },
        bar: { borderRadius: 3 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.control,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: color.border },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: color.borderStrong },
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: tokens.radius.pill, fontWeight: 500 } },
    },
    MuiAlert: { styleOverrides: { root: { borderRadius: tokens.radius.control } } },
    MuiSkeleton: { styleOverrides: { root: { backgroundColor: color.surfaceMuted } } },
  },
});
