import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { spacing, radius, typography } from '@/src/theme';
import type { ActivePalette } from '@/src/theme/ThemeProvider';

export const createHomeScreenStyles = (colors: ActivePalette, isDark: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: spacing.md,
      paddingBottom: spacing['3xl'],
      alignItems: 'center',
    },
    responsiveContainer: {
      width: '100%',
      maxWidth: 680,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
      paddingTop: spacing.xs,
    },
    greeting: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    companyName: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
      marginTop: 1,
    },
    periodBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.border,
    },
    periodText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
    },
    quickActionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
      backgroundColor: colors.surface,
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
    },
    quickActionBtn: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 4,
    },
    actionIconWrapper: {
      width: 46,
      height: 46,
      borderRadius: 23,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 6,
    },
    actionLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    heroCard: {
      backgroundColor: colors.surface,
      padding: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    heroHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    cardHeaderWithArrow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    heroSubtitle: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    profitText: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.text,
      marginTop: 2,
    },
    marginBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.successSoft,
      paddingHorizontal: 9,
      paddingVertical: 3,
      borderRadius: radius.full,
      gap: 4,
    },
    marginText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.success,
    },
    heroDivider: {
      height: 1,
      backgroundColor: colors.divider,
      marginVertical: spacing.md,
    },
    heroDetailsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    heroDetailItem: {
      flex: 1,
    },
    heroDetailLabel: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    revenueText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primary,
      marginTop: 2,
    },
    expenseText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.danger,
      marginTop: 2,
    },
    heroVerticalDivider: {
      width: 1,
      backgroundColor: colors.divider,
      marginHorizontal: spacing.md,
    },
    goalCard: {
      backgroundColor: colors.surface,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    goalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    goalTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    rowCentered: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    goalTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    goalPctBadge: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.primary,
    },
    progressBarBg: {
      height: 8,
      backgroundColor: colors.divider,
      borderRadius: radius.full,
      overflow: 'hidden',
      marginVertical: 6,
    },
    progressBarFill: {
      height: '100%',
      borderRadius: radius.full,
    },
    goalFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    goalFooterLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    goalFooterSub: {
      fontSize: 11,
      color: colors.textLight,
    },
    kpiGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: spacing.sm,
      marginBottom: spacing.md,
    },
    kpiCardWrapper: {
      width: '48.5%',
    },
    kpiCard: {
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    kpiCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 2,
    },
    kpiTitle: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
    },
    kpiIconBadge: {
      width: 24,
      height: 24,
      borderRadius: radius.full,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    kpiValue: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
      marginTop: 2,
    },
    kpiFooterRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 2,
    },
    kpiSub: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    overdueText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.danger,
    },
    okText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.success,
    },
    chartCard: {
      backgroundColor: colors.surface,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chartRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      height: 100,
      marginVertical: spacing.sm,
    },
    barCol: {
      flex: 1,
      alignItems: 'center',
      height: '100%',
      justifyContent: 'flex-end',
    },
    barsWrapper: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 3,
      height: 80,
    },
    barItem: {
      width: 7,
      borderRadius: 3,
    },
    barMonthLabel: {
      fontSize: 9,
      color: colors.textSecondary,
      marginTop: 4,
    },
    chartLegend: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 16,
      marginTop: 4,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    legendLabel: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    section: {
      marginBottom: spacing.md,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    sectionSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    seeAllBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      paddingVertical: 2,
    },
    seeAllText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
    },
    sectionCard: {
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    followUpCard: {
      backgroundColor: colors.surface,
      padding: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.xs,
    },
    followUpInfo: {
      flex: 1,
      marginRight: spacing.sm,
    },
    followUpTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
    },
    followUpNotes: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
    },
    whatsappBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#16A34A',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: radius.md,
      gap: 4,
    },
    whatsappBtnText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '700',
    },
    emptyText: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      gap: spacing.sm,
    },
    listItemBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    listItemContent: {
      flex: 1,
    },
    listItemTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    listItemValue: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    listIconContainer: {
      width: 36,
      height: 36,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    listIconPrimary: {
      backgroundColor: colors.primarySoft,
    },
    listIconWarning: {
      backgroundColor: colors.warningSoft,
    },
    stockAlertDetail: {
      fontSize: 11,
      color: colors.danger,
      fontWeight: '500',
    },
    buyActionBtn: {
      backgroundColor: colors.primarySoft,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: radius.md,
    },
    buyActionText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
    },
  });

// Fallback estático para compatibilidade com import direto de `styles`
import { colors as defaultColors } from '@/src/theme';
export const styles = createHomeScreenStyles(defaultColors, false);
