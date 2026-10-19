import { alpha, createTheme } from '@mui/material/styles';

/**
 * Design tokens. An original, restrained blue-and-neutral palette. All text
 * colours meet WCAG 2.2 AA (4.5:1) against both background tokens.
 */
export const tokens = {
  color: {
    primary: '#1A4FA0',
    primaryDark: '#123A78',
    primarySoft: '#E8EFFA',
    background: '#F4F6FA',
    surface: '#FFFFFF',
    border: '#E1E6EE',
    textPrimary: '#14213D',
    textSecondary: '#526079',
    success: '#1B7344',
    successSoft: '#E5F4EC',
    warning: '#8A4B00',
    warningSoft: '#FFF2DE',
    error: '#B3261E',
    errorSoft: '#FCE8E6',
    chartMuted: '#A9BCDD',
  },
  radius: 12,
} as const;

const fontFamily = [
  'Inter',
  'system-ui',
  '-apple-system',
  '"Segoe UI"',
  'Roboto',
  '"Helvetica Neue"',
  'Arial',
  'sans-serif',
].join(',');

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: tokens.color.primary,
      dark: tokens.color.primaryDark,
      contrastText: '#FFFFFF',
    },
    success: { main: tokens.color.success },
    warning: { main: tokens.color.warning },
    error: { main: tokens.color.error },
    background: { default: tokens.color.background, paper: tokens.color.surface },
    text: { primary: tokens.color.textPrimary, secondary: tokens.color.textSecondary },
    divider: tokens.color.border,
  },
  shape: { borderRadius: tokens.radius },
  typography: {
    fontFamily,
    h1: { fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.01em' },
    h2: { fontSize: '1.125rem', fontWeight: 650, letterSpacing: '-0.005em' },
    h3: { fontSize: '1rem', fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { WebkitFontSmoothing: 'antialiased', fontVariantNumeric: 'tabular-nums' },
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '0.01ms !important',
            transitionDuration: '0.01ms !important',
          },
        },
      },
    },
    MuiCard: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: { root: { borderColor: tokens.color.border } },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          '&.Mui-focusVisible': {
            outline: `3px solid ${alpha(tokens.color.primary, 0.55)}`,
            outlineOffset: 2,
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          minHeight: 40,
          paddingInline: 12,
          color: tokens.color.textSecondary,
          '&.Mui-selected': {
            color: tokens.color.primaryDark,
            backgroundColor: tokens.color.primarySoft,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 600, color: tokens.color.textSecondary, whiteSpace: 'nowrap' },
      },
    },
    MuiLinearProgress: {
      styleOverrides: { root: { height: 8, borderRadius: 4 }, bar: { borderRadius: 4 } },
    },
  },
});
