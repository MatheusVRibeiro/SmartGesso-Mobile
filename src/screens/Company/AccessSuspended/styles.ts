import { StyleSheet } from 'react-native';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { typography, spacing, radius, sizes } from '@/src/theme';

export const createAccessSuspendedStyles = (colors: ActivePalette, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
    },
    card: {
      alignSelf: 'center',
      width: '100%',
      maxWidth: sizes.maxContentWidth,
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
    },
    iconCircle: {
      width: 72,
      height: 72,
      borderRadius: radius.full,
      backgroundColor: colors.dangerSoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xl,
    },
    title: {
      fontSize: typography.sizes['2xl'],
      fontWeight: typography.weights.bold,
      color: colors.text,
      textAlign: 'center',
      letterSpacing: -0.5,
      marginBottom: spacing.md,
    },
    description: {
      fontSize: typography.sizes.md,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: typography.sizes.md * 1.5,
      marginBottom: spacing['3xl'],
    },
    companyName: {
      fontWeight: typography.weights.semibold,
      color: colors.text,
    },
    buttonsContainer: {
      width: '100%',
      gap: spacing.md,
    },
    button: {
      width: '100%',
    },
  });
