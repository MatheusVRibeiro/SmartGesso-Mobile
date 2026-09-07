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
    alertBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(217, 119, 6, 0.15)' : '#FFFBEB',
      borderColor: isDark ? 'rgba(217, 119, 6, 0.4)' : '#FDE68A',
      borderWidth: 1,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
      marginBottom: spacing.md,
      gap: spacing.sm,
    },
    alertIconWrapper: {
      width: 36,
      height: 36,
      borderRadius: radius.full,
      backgroundColor: isDark ? 'rgba(217, 119, 6, 0.25)' : '#FEF3C7',
      alignItems: 'center',
      justifyContent: 'center',
    },
    alertContent: {
      flex: 1,
    },
    alertTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: isDark ? '#FCD34D' : '#92400E',
    },
    alertSubtitle: {
      fontSize: 11,
      color: isDark ? '#FDE68A' : '#B45309',
      marginTop: 1,
    },
    quickActionsSection: {
      marginBottom: spacing.md,
    },
    quickActionsTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 10,
      letterSpacing: -0.3,
    },
    quickActionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 6,
    },
    quickActionItem: {
      flex: 1,
      alignItems: 'center',
    },
    actionCard: {
      width: 54,
      height: 54,
      minWidth: 54,
      minHeight: 54,
      borderRadius: 14,
      backgroundColor: isDark ? '#1C1F28' : colors.surface,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      boxShadow: isDark
        ? '0px 2px 8px rgba(0, 0, 0, 0.4)'
        : '0px 2px 6px rgba(15, 23, 42, 0.04)',
      elevation: 2,
    },
    actionLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: isDark ? '#F1F5F9' : '#334155',
      textAlign: 'center',
      marginTop: 7,
      letterSpacing: -0.2,
      lineHeight: 14,
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
