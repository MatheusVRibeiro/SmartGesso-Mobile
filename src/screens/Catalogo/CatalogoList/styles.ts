import { StyleSheet } from 'react-native';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { typography, spacing, radius, sizes } from '@/src/theme';

export const createCatalogoStyles = (colors: ActivePalette, isDark: boolean) =>
  StyleSheet.create({
    header: {
      marginBottom: spacing.xl,
      paddingTop: spacing.md,
    },
    title: {
      fontSize: typography.sizes['2xl'],
      fontWeight: typography.weights.bold,
      color: colors.text,
      letterSpacing: -0.5,
    },
    subtitle: {
      marginTop: 2,
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
    },
    cardsContainer: {
      gap: spacing.md,
      paddingBottom: spacing['4xl'],
    },
    cardPressed: {
      opacity: 0.85,
    },
    card: {
      padding: spacing.lg,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: radius.lg,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    countContainer: {
      alignItems: 'flex-end',
    },
    countValue: {
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.bold,
      color: colors.text,
    },
    countLabel: {
      fontSize: typography.sizes.xs,
      color: colors.textSecondary,
    },
    cardTitle: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.semibold,
      color: colors.text,
    },
    cardDescription: {
      marginTop: spacing.xs,
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
    },
    cardFooter: {
      marginTop: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    cardAction: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
      color: colors.primary,
    },
  });
