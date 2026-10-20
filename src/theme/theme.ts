import { alpha, createTheme, useTheme, type PaletteMode } from '@mui/material/styles';

/**
 * Design system. Surfaces are separated by soft shadows rather than borders.
 * Capitec blue is the single accent: the sidebar, the hero metric, selected
 * controls and the primary data series. Category colours from the API appear
 * only as chart marks and small dots; status colours only as small markers.
 *
 * Each colour mode has a concrete palette. Components style themselves with
 * `tokens.color.*`, which are CSS custom properties, so switching modes
 * re-themes everything without re-rendering style logic. Charts need concrete
 * values for SVG attributes and read them through `useAppColors()`.
 *
 * Text colours meet WCAG 2.2 AA (4.5:1) against the surfaces they sit on, in
 * both modes.
 */
const palettes = {
  light: {
    accent: '#004973',
    accentDark: '#00344F',
    accentLight: '#2B7DAA',
    accentFg: '#004973',
    accentSoft: '#E6EFF5',
    background: '#F2F4F7',
    surface: '#FFFFFF',
    surfaceMuted: '#F4F6F8',
    surfaceHover: '#ECEFF3',
    border: '#E8EBEF',
    textPrimary: '#101828',
    textSecondary: '#5D6679',
    textTertiary: '#6B7385',
    onAccent: '#FFFFFF',
    onAccentMuted: 'rgba(255, 255, 255, 0.76)',
    success: '#15803D',
    warning: '#B45309',
    error: '#B42318',
    chartMuted: '#B9CEDB',
    track: '#EDF0F3',
    navSurface: 'rgba(255, 255, 255, 0.86)',
    shadowCard: '0 1px 2px rgba(16, 24, 40, 0.04), 0 8px 24px -6px rgba(16, 24, 40, 0.08)',
    shadowRaised: '0 2px 4px rgba(16, 24, 40, 0.05), 0 16px 40px -8px rgba(16, 24, 40, 0.14)',
    shadowControl: '0 1px 2px rgba(16, 24, 40, 0.06), 0 2px 6px rgba(16, 24, 40, 0.06)',
  },
  dark: {
    accent: '#0A6A9E',
    accentDark: '#06496E',
    accentLight: '#4FA6D8',
    accentFg: '#7CC4EE',
    accentSoft: 'rgba(124, 196, 238, 0.12)',
    background: '#0A101C',
    surface: '#121A29',
    surfaceMuted: '#1A2335',
    surfaceHover: '#212C41',
    border: '#243049',
    textPrimary: '#E8ECF3',
    textSecondary: '#9EA9BD',
    textTertiary: '#8A95AA',
    onAccent: '#FFFFFF',
    onAccentMuted: 'rgba(255, 255, 255, 0.78)',
    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#F87171',
    chartMuted: '#2C4A61',
    track: '#232E44',
    navSurface: 'rgba(18, 26, 41, 0.86)',
    shadowCard: '0 1px 2px rgba(0, 0, 0, 0.3), 0 8px 24px -6px rgba(0, 0, 0, 0.45)',
    shadowRaised: '0 2px 4px rgba(0, 0, 0, 0.35), 0 16px 40px -8px rgba(0, 0, 0, 0.6)',
    shadowControl: '0 1px 2px rgba(0, 0, 0, 0.35), 0 2px 6px rgba(0, 0, 0, 0.3)',
  },
} as const;

export type AppColors = { [K in keyof (typeof palettes)['light']]: string };
type ColorKey = keyof AppColors;

const cssVarName = (key: string) => `--si-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;

function cssVars(mode: PaletteMode): Record<string, string> {
  return Object.fromEntries(
    Object.entries(palettes[mode]).map(([key, value]) => [cssVarName(key), value]),
  );
}

const colorVars = Object.fromEntries(
  Object.keys(palettes.light).map((key) => [key, `var(${cssVarName(key)})`]),
) as Record<ColorKey, string>;

export const tokens = {
  /** CSS custom properties; use in `sx` and other CSS contexts. */
  color: colorVars,
  radius: { card: 20, control: 12, pill: 999 },
  shadow: {
    card: colorVars.shadowCard,
    raised: colorVars.shadowRaised,
    control: colorVars.shadowControl,
    accent: '0 12px 32px -10px rgba(0, 52, 79, 0.55)',
  },
  gradient: {
    accent: 'linear-gradient(150deg, #00598A 0%, #004973 45%, #00344F 100%)',
  },
  /** Card padding, in theme spacing units (8px), used by every card. */
  cardPadding: { xs: 2.5, sm: 3 },
} as const;

/** Concrete colours for the active mode, for places CSS variables cannot reach (SVG). */
export function useAppColors(): AppColors {
  return palettes[useTheme().palette.mode];
}

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

export function createAppTheme(mode: PaletteMode) {
  const color = palettes[mode];
  return createTheme({
    palette: {
      mode,
      primary: {
        main: color.accentFg,
        dark: color.accentDark,
        contrastText: mode === 'light' ? color.onAccent : '#04131F',
      },
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
          ':root': { ...cssVars(mode), colorScheme: mode },
          body: {
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            fontFeatureSettings: '"tnum" 1, "cv11" 1',
            transition: 'background-color 200ms ease',
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
            boxShadow: color.shadowCard,
            backgroundColor: color.surface,
          },
        },
      },
      MuiButtonBase: {
        styleOverrides: {
          root: {
            '&.Mui-focusVisible': { outline: `2px solid ${color.accentLight}`, outlineOffset: 2 },
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
            boxShadow: color.shadowControl,
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
      MuiTableRow: {
        styleOverrides: {
          root: { '&.MuiTableRow-hover:hover': { backgroundColor: color.surfaceMuted } },
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
            boxShadow: color.shadowRaised,
            backgroundColor: color.surface,
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
              color: color.accentFg,
              fontWeight: 600,
            },
            '&.Mui-selected:hover': { backgroundColor: alpha(color.accentLight, 0.16) },
          },
        },
      },
      MuiTooltip: {
        defaultProps: { arrow: true, enterDelay: 250, enterTouchDelay: 300 },
        styleOverrides: {
          tooltip: {
            backgroundColor: mode === 'light' ? '#101828' : '#E8ECF3',
            color: mode === 'light' ? '#FFFFFF' : '#101828',
            fontSize: '0.75rem',
            fontWeight: 500,
            lineHeight: 1.45,
            padding: '7px 10px',
            borderRadius: 8,
            boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.35)',
            maxWidth: 240,
          },
          arrow: { color: mode === 'light' ? '#101828' : '#E8ECF3' },
        },
      },
    },
  });
}

/** Default (light) theme, used by tests and as the initial theme. */
export const theme = createAppTheme('light');
