import { StyleSheet } from 'react-native';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { typography, spacing } from '@/src/theme';

export const createSplashStyles = (colors: ActivePalette, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      marginTop: spacing.md,
      fontSize: typography.sizes.md,
      color: colors.textSecondary,
    },
  });
