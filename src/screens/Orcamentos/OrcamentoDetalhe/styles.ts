import { StyleSheet } from 'react-native';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { typography, spacing, radius, shadows, sizes } from '@/src/theme';

export const createOrcamentoDetalheStyles = (colors: ActivePalette, isDark: boolean) =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.xl,
      paddingTop: spacing.md,
    },
    backButton: {
      minWidth: sizes.touchTarget,
      minHeight: sizes.touchTarget,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      flex: 1,
      fontSize: typography.sizes['2xl'],
      fontWeight: typography.weights.bold,
      color: colors.text,
      letterSpacing: -0.5,
    },
    pdfButton: {
      width: 40,
      height: 40,
      borderRadius: radius.full,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pdfButtonPressed: {
      opacity: 0.8,
    },
    pdfButtonDisabled: {
      opacity: 0.5,
    },
    clientCard: {
      padding: spacing.md,
      marginBottom: spacing.lg,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
    },
    clientContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    clientIcon: {
      width: 44,
      height: 44,
      borderRadius: radius.full,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    clientInfo: {
      flex: 1,
      gap: spacing.xs,
    },
    clientName: {
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.semibold,
      color: colors.text,
    },
    clientContact: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
    },
    clientRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    clientRowText: {
      flex: 1,
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
    },
    sectionLabel: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.bold,
      color: colors.text,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    emptyText: {
      fontSize: typography.sizes.sm,
      color: colors.textLight,
      fontStyle: 'italic',
      textAlign: 'center',
      paddingVertical: spacing.md,
    },
    itemCard: {
      padding: spacing.md,
      marginBottom: spacing.sm,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
    },
    itemHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: spacing.md,
      marginBottom: spacing.xs,
    },
    itemName: {
      flex: 1,
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.medium,
      color: colors.text,
    },
    itemTotal: {
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.bold,
      color: colors.primary,
    },
    itemMeta: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: spacing.md,
    },
    itemQuantity: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
    },
    itemUnitPrice: {
      fontSize: typography.sizes.xs,
      color: colors.textLight,
    },
    summaryCard: {
      padding: spacing.md,
      marginTop: spacing.md,
      marginBottom: spacing.lg,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
    },
    summaryLabel: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
    },
    summaryValue: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.medium,
      color: colors.text,
    },
    discountValue: {
      color: colors.danger,
    },
    totalRow: {
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    totalLabel: {
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.semibold,
      color: colors.text,
    },
    totalValue: {
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.bold,
      color: colors.primary,
    },
    obsCard: {
      padding: spacing.md,
      marginBottom: spacing.lg,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
    },
    obsText: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
      lineHeight: typography.sizes.sm * 1.5,
    },
    historyCard: {
      padding: spacing.md,
      marginBottom: spacing.lg,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
    },
    historyItem: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingVertical: spacing.xs,
    },
    historyItemBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    historyDot: {
      width: 8,
      height: 8,
      borderRadius: radius.full,
      backgroundColor: colors.primary,
      marginTop: 6,
    },
    historyContent: {
      flex: 1,
      gap: 2,
    },
    historyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    historyStatus: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
      color: colors.text,
    },
    historyDate: {
      fontSize: typography.sizes.xs,
      color: colors.textLight,
    },
    historyNote: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: colors.overlay,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    modalCard: {
      width: '100%',
      maxWidth: 340,
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      padding: spacing['2xl'],
      borderColor: colors.border,
      borderWidth: 1,
      ...shadows.medium,
    },
    modalIcon: {
      alignSelf: 'center',
      marginBottom: spacing.md,
    },
    modalTitle: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.bold,
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    modalMessage: {
      fontSize: typography.sizes.md,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: spacing.sm,
    },
    modalButton: {
      flex: 1,
    },
    rejectInput: {
      marginBottom: spacing.lg,
    },
    actions: {
      gap: spacing.sm,
      marginTop: spacing.lg,
      marginBottom: spacing['3xl'],
    },
    actionButton: {
      marginBottom: spacing.xs,
    },
  });
