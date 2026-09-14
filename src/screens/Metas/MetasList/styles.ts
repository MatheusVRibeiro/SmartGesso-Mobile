import { StyleSheet } from 'react-native';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { typography, spacing, radius, sizes } from '@/src/theme';

export const createMetasStyles = (colors: ActivePalette, isDark: boolean) =>
  StyleSheet.create({
    scrollContent: {
      padding: sizes.screenPadding,
      paddingTop: spacing.xs,
      paddingBottom: spacing['4xl'],
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.xl,
      paddingTop: spacing.xs,
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

    // Seleção de período
    periodSection: {
      marginBottom: spacing.xl,
    },
    periodLabel: {
      fontSize: typography.sizes.xs,
      fontWeight: typography.weights.semibold,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: spacing.sm,
    },
    periodScroll: {
      flexGrow: 0,
    },
    periodChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: spacing.xs,
    },
    periodChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    periodChipText: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
      color: colors.text,
    },
    periodChipTextActive: {
      color: colors.textOnPrimary,
    },
    yearRow: {
      flexDirection: 'row',
    },

    // Cards de meta vs realizado
    goalCards: {
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    goalCard: {
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
    },
    goalCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    goalCardIcon: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    goalCardTitle: {
      flex: 1,
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
      color: colors.text,
    },
    goalCardValue: {
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.bold,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    progressBarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    progressBarBackground: {
      flex: 1,
      height: 8,
      borderRadius: radius.full,
      backgroundColor: colors.border,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      borderRadius: radius.full,
    },
    progressBarText: {
      fontSize: typography.sizes.xs,
      fontWeight: typography.weights.semibold,
      color: colors.textSecondary,
      minWidth: 44,
      textAlign: 'right',
    },

    // Seções
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

    // Resumo do período
    summaryRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: spacing.md,
    },
    summaryItem: {
      alignItems: 'center',
      width: '48%',
    },
    summaryValue: {
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.bold,
      color: colors.text,
    },
    summaryLabel: {
      fontSize: typography.sizes.xs,
      color: colors.textSecondary,
      marginTop: 2,
      textAlign: 'center',
    },

    // Lista por vendedor
    memberItem: {
      paddingVertical: spacing.sm,
    },
    memberItemBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    memberHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    memberAvatar: {
      width: 36,
      height: 36,
      borderRadius: radius.full,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    memberAvatarText: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.bold,
      color: colors.primary,
    },
    memberInfo: {
      flex: 1,
    },
    memberName: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
      color: colors.text,
    },
    memberRole: {
      fontSize: typography.sizes.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    memberRevenue: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.bold,
      color: colors.text,
    },
    memberStats: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
      marginTop: spacing.xs,
      marginLeft: 48,
    },
    memberStat: {
      fontSize: typography.sizes.xs,
      color: colors.textSecondary,
    },

    // Botão
    buttonContainer: {
      marginTop: spacing.md,
    },
    button: {
      width: '100%',
    },

    // Modal
    modalSafe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.bold,
      color: colors.text,
    },
    modalSubtitle: {
      fontSize: typography.sizes.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    modalClose: {
      width: sizes.touchTarget,
      height: sizes.touchTarget,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalBody: {
      padding: spacing.lg,
      paddingBottom: spacing['3xl'],
    },
    modalError: {
      fontSize: typography.sizes.sm,
      color: colors.danger,
      marginBottom: spacing.md,
    },
    modalActions: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.sm,
    },
    modalAction: {
      flex: 1,
    },
  });
