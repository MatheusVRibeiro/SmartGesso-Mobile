import { StyleSheet } from 'react-native';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { typography, spacing, radius, sizes } from '@/src/theme';

export const createPagamentosStyles = (colors: ActivePalette, isDark: boolean) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: sizes.screenPadding,
      paddingTop: spacing.xs,
      paddingBottom: spacing.sm,
      gap: spacing.sm,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flex: 1,
    },
    headerText: {
      flex: 1,
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
    addButton: {
      width: 42,
      height: 42,
      borderRadius: radius.full,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    searchWrapper: {
      paddingHorizontal: sizes.screenPadding,
      marginTop: spacing.xs,
    },
    listContent: {
      padding: sizes.screenPadding,
      paddingTop: spacing.xs,
      paddingBottom: spacing['4xl'],
    },
    metricsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.md,
      marginBottom: spacing.xl,
    },
    metricCard: {
      flex: 1,
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
    },
    metricIconContainer: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    metricTitle: {
      fontSize: typography.sizes.xs,
      fontWeight: typography.weights.semibold,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    metricValue: {
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.bold,
      color: colors.text,
      marginBottom: spacing.xs,
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
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
    },
    emptyText: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
      paddingVertical: spacing.md,
      textAlign: 'center',
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
    },
    listItemBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    listItemPressed: {
      opacity: 0.7,
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
    listItemDate: {
      fontSize: typography.sizes.xs,
      color: colors.textSecondary,
    },
    listItemRight: {
      alignItems: 'flex-end',
      gap: 2,
      marginLeft: spacing.sm,
    },
    listItemValue: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.bold,
      color: colors.text,
    },
    listItemValueOverdue: {
      color: colors.danger,
    },
    filters: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      borderWidth: 1,
    },
    chipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipUnselected: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    chipText: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
    },
    chipTextSelected: {
      color: colors.textOnPrimary,
    },
    chipTextUnselected: {
      color: colors.textSecondary,
    },
    card: {
      marginBottom: spacing.md,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
    },
    cardPressable: {
      gap: spacing.sm,
    },
    cardPressed: {
      opacity: 0.7,
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
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardInfo: {
      flex: 1,
      gap: spacing.xs,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    cardTitle: {
      flex: 1,
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.semibold,
      color: colors.text,
    },
    cardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    cardText: {
      flex: 1,
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
    },
    cardTextOverdue: {
      color: colors.danger,
    },
    cardAmount: {
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.bold,
      color: colors.success,
    },
    cardAmountOverdue: {
      color: colors.danger,
    },
  });
