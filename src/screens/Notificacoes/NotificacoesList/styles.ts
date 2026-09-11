import { StyleSheet } from 'react-native';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { typography, spacing, radius, sizes } from '@/src/theme';

export const createNotificacoesStyles = (colors: ActivePalette, isDark: boolean) =>
  StyleSheet.create({
    header: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    title: {
      fontSize: typography.sizes['2xl'],
      fontWeight: typography.weights.bold,
      color: colors.text,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
      marginTop: 2,
    },
    listContent: {
      padding: spacing.lg,
      paddingBottom: spacing['5xl'],
    },
    sectionHeader: {
      fontSize: typography.sizes.xs,
      fontWeight: typography.weights.bold,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: spacing.sm,
      marginLeft: spacing.xs,
      marginTop: spacing.md,
    },
    card: {
      marginBottom: spacing.md,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    cardIcon: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardInfo: {
      flex: 1,
      gap: spacing.xs,
    },
    cardTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    cardTitle: {
      flexShrink: 1,
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.semibold,
      color: colors.text,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: radius.full,
      backgroundColor: colors.primary,
    },
    cardDescription: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    cardDate: {
      fontSize: typography.sizes.xs,
      color: colors.textSecondary,
      fontWeight: typography.weights.medium,
    },
  });
