import { StyleSheet } from 'react-native';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { typography, spacing, radius, sizes } from '@/src/theme';

export const createResetPasswordStyles = (colors: ActivePalette, isDark: boolean) =>
  StyleSheet.create({
    topBar: {
      paddingTop: spacing.md,
    },
    header: {
      marginTop: spacing['3xl'],
      marginBottom: spacing['3xl'],
    },
    title: {
      fontSize: typography.sizes['3xl'],
      fontWeight: typography.weights.bold,
      color: colors.text,
      letterSpacing: -0.5,
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontSize: typography.sizes.md,
      color: colors.textSecondary,
      lineHeight: 24,
    },
    card: {
      alignSelf: 'center',
      width: '100%',
      maxWidth: sizes.maxContentWidth,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
    },
    submitButton: {
      marginTop: spacing.lg,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: spacing['3xl'],
    },
    errorCircle: {
      width: 72,
      height: 72,
      borderRadius: radius.full,
      backgroundColor: colors.dangerSoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    errorCircleText: {
      fontSize: typography.sizes['3xl'],
      fontWeight: typography.weights.bold,
      color: colors.danger,
    },
    errorTitle: {
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.bold,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    errorSubtitle: {
      fontSize: typography.sizes.md,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing['2xl'],
      lineHeight: 24,
    },
    errorButton: {
      alignSelf: 'center',
      width: '100%',
      maxWidth: sizes.maxContentWidth,
    },
  });
