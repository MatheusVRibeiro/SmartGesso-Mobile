import { StyleSheet } from 'react-native';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { typography, spacing, radius, sizes } from '@/src/theme';

export const createAcceptInvitationStyles = (colors: ActivePalette, isDark: boolean) =>
  StyleSheet.create({
    header: {
      alignItems: 'center',
      marginTop: spacing['4xl'],
      marginBottom: spacing['3xl'],
    },
    logoCircle: {
      width: 72,
      height: 72,
      borderRadius: radius.full,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    logo: {
      fontSize: typography.sizes['3xl'],
      fontWeight: typography.weights.bold,
      color: colors.text,
      letterSpacing: -0.5,
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontSize: typography.sizes.md,
      color: colors.textSecondary,
    },
    card: {
      alignSelf: 'center',
      width: '100%',
      maxWidth: sizes.maxContentWidth,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
    },
    cardDescription: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
      marginBottom: spacing.lg,
      textAlign: 'center',
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
      minWidth: 200,
    },
  });
