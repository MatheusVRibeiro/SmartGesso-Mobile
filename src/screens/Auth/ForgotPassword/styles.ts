import { StyleSheet } from 'react-native';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { typography, spacing, radius, sizes } from '@/src/theme';

export const createForgotPasswordStyles = (colors: ActivePalette, isDark: boolean) =>
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
    backButton: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.md,
      minHeight: sizes.touchTarget,
    },
    backText: {
      fontSize: typography.sizes.sm,
      color: colors.primary,
      fontWeight: typography.weights.medium,
    },
    successContainer: {
      alignItems: 'center',
      paddingVertical: spacing['2xl'],
    },
    successCircle: {
      width: 72,
      height: 72,
      borderRadius: radius.full,
      backgroundColor: colors.successSoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    successText: {
      fontSize: typography.sizes.md,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
  });
