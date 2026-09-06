import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from './colors';

export type ThemeMode = 'light' | 'dark' | 'system';

/** Paleta ativa (cores base + overrides dark). */
export type ActivePalette = typeof colors;

export interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  colors: ActivePalette;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

const THEME_STORAGE_KEY = '@smartgesso_theme_mode';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * ThemeProvider — fornece o tema claro (Indigo Enterprise) ou escuro
 * (Linear Dark) para toda a árvore de componentes.
 *
 * Suporta:
 * - 'light': força tema claro
 * - 'dark': força tema escuro
 * - 'system': acompanha a configuração do dispositivo
 *
 * A escolha é persistida no AsyncStorage.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setModeState(saved);
        }
      })
      .catch(() => {
        // Fallback silencioso para valor padrão
      });
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, newMode).catch(() => {});
  };

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';

  const value = useMemo<ThemeContextValue>(() => {
    const palette = (
      isDark ? { ...colors, ...colors.dark } : colors
    ) as unknown as typeof colors;

    return {
      mode,
      isDark,
      colors: palette,
      setMode,
      toggle: () => setMode(isDark ? 'light' : 'dark'),
    };
  }, [mode, isDark]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/** Hook de acesso ao tema ativo. */
export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Fallback tolerante: componentes renderizados fora do provider
    // (ex.: testes unitários) usam o tema claro por padrão.
    const { dark: _dark, ...base } = colors;
    return {
      mode: 'light',
      isDark: false,
      colors: base as ThemeContextValue['colors'],
      setMode: () => {},
      toggle: () => {},
    };
  }
  return ctx;
}

export default ThemeProvider;
