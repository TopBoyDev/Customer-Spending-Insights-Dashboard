import { CssBaseline, ThemeProvider, type PaletteMode } from '@mui/material';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { createAppTheme } from './theme';

const STORAGE_KEY = 'si-color-mode';

interface ColorModeContextValue {
  mode: PaletteMode;
  setMode: (mode: PaletteMode) => void;
}

const ColorModeContext = createContext<ColorModeContextValue>({
  mode: 'light',
  setMode: () => {},
});

/** Light is the default; an explicit choice is remembered on this device. */
function readStoredMode(): PaletteMode {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    // Storage can be unavailable (private mode, blocked site data).
    return 'light';
  }
}

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<PaletteMode>(readStoredMode);

  const setMode = useCallback((next: PaletteMode) => {
    setModeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Preference simply will not persist.
    }
  }, []);

  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook belongs with its provider
export function useColorMode(): ColorModeContextValue {
  return useContext(ColorModeContext);
}
