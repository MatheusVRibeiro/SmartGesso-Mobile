import { StyleSheet } from 'react-native';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { typography, spacing, radius, sizes } from '@/src/theme';

export const createRelatoriosStyles = (colors: ActivePalette, isDark: boolean) =>
  StyleSheet.create({
    scrollContent: {
      padding: sizes.screenPadding,
      paddingTop: spacing.xs,
      paddingBottom: spacing['4xl'],
    },
    header: {
      marginBottom: spacing.xl,
      paddingTop: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
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
    pendingBadge: {
      backgroundColor: colors.warning,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.full,
      alignSelf: 'flex-start',
    },
    pendingBadgeText: {
      color: colors.white,
      fontSize: typography.sizes.xs,
      fontWeight: typography.weights.semibold,
    },
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: spacing.md,
      marginBottom: spacing.xl,
    },
    metricCard: {
      width: '48%',
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
    },
    metricIconContainer: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    metricTitle: {
      fontSize: typography.sizes.xs,
      fontWeight: typography.weights.semibold,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    metricValue: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.bold,
      color: colors.text,
      marginBottom: 2,
    },
    metricSubtitle: {
      fontSize: typography.sizes.xs,
      color: colors.textSecondary,
      lineHeight: 14,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.bold,
      color: colors.text,
      marginBottom: 2,
    },
    sectionSubtitle: {
      fontSize: typography.sizes.xs,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    sectionCard: {
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
    },
    emptyText: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      paddingVertical: spacing.sm,
    },
    listItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },
    listItemBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    listItemContent: {
      flex: 1,
      marginRight: spacing.md,
    },
    listItemTitle: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
      color: colors.text,
      marginBottom: 2,
    },
    listItemValue: {
      fontSize: typography.sizes.xs,
      color: colors.textSecondary,
    },
    listItemValueSuccess: {
      color: colors.success,
      fontWeight: typography.weights.semibold,
    },
    buttonContainer: {
      marginTop: spacing.md,
    },
    button: {
      width: '100%',
    },
  });
