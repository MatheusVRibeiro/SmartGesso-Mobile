import { StyleSheet } from 'react-native';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { typography, spacing, radius, sizes } from '@/src/theme';

export const createCompanyProfileStyles = (colors: ActivePalette, isDark: boolean) =>
  StyleSheet.create({
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    emptyCircle: {
      width: 72,
      height: 72,
      borderRadius: radius.full,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    emptyTitle: {
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.bold,
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    emptyDescription: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    emptyButton: {
      minWidth: 200,
    },
    header: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
    },
    iconContainer: {
      width: 72,
      height: 72,
      borderRadius: radius.full,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    companyName: {
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.bold,
      color: colors.text,
      textAlign: 'center',
    },
    companyDocument: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    badgeContainer: {
      marginTop: spacing.sm,
    },
    infoCard: {
      padding: spacing.md,
      marginBottom: spacing.lg,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      gap: spacing.md,
    },
    detailIcon: {
      width: 36,
      height: 36,
      borderRadius: radius.full,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    detailInfo: {
      flex: 1,
      gap: 2,
    },
    detailLabel: {
      fontSize: typography.sizes.xs,
      color: colors.textSecondary,
    },
    detailValue: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
      color: colors.text,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.xs,
    },
    actionsSection: {
      gap: spacing.md,
      marginTop: spacing.sm,
      marginBottom: spacing['2xl'],
    },
    actionButton: {
      width: '100%',
    },
  });
