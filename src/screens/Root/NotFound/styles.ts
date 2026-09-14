import { StyleSheet } from 'react-native';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { typography, spacing } from '@/src/theme';

export const createNotFoundStyles = (colors: ActivePalette, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.bold,
      color: colors.text,
    },
    link: {
      marginTop: spacing.md,
      paddingVertical: spacing.md,
      color: colors.primary,
      fontWeight: typography.weights.medium,
    },
  });
