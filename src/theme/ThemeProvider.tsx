import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { colors, Colors } from '../theme';

type ThemeMode = 'light' | 'dark';

/** Paleta ativa (cores base + overrides dark). */
type ActivePalette = typeof colors;

interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  colors: ActivePalette;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * ThemeProvider — fornece o tema claro (indigo Enterprise) ou escuro
 * (Linear Dark) para toda a árvore de componentes.
 *
 * Padrão: segue o sistema do device (useColorScheme). Usuário pode
 * sobrescrever via setMode/toggle (persistido em memória).
 *
 * Uso:
 *   const { isDark, colors, toggle } = useAppTheme();
 *   <View style={{ backgroundColor: colors.background }} />
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(
    systemScheme === 'dark' ? 'dark' : 'light',
  );

  const value = useMemo<ThemeContextValue>(() => {
    const isDark = mode === 'dark';
    const palette = (
      isDark ? { ...colors, ...colors.dark } : colors
    ) as unknown as typeof colors;
    return {
      mode,
      isDark,
      colors: palette,
      setMode,
      toggle: () => setMode((m) => (m === 'dark' ? 'light' : 'dark')),
    };
  }, [mode]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/** Hook de acesso ao tema ativo. */
export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme deve ser usado dentro de <ThemeProvider>');
  }
  return ctx;
}

export default ThemeProvider;
