import { StyleSheet } from 'react-native';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { typography, spacing, radius, sizes } from '@/src/theme';

export const createConfiguracaoEmpresaStyles = (colors: ActivePalette, isDark: boolean) =>
  StyleSheet.create({
    warningBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: colors.warningSoft,
      borderWidth: 1,
      borderColor: colors.warning,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.xl,
    },
    warningText: {
      flex: 1,
      fontSize: typography.sizes.sm,
      color: colors.text,
    },
    sectionTitle: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: spacing.md,
    },
    row: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    rowItem: {
      flex: 1,
    },
    rowItemWide: {
      flex: 2,
    },
    rowItemState: {
      width: 80,
    },
    actionsSection: {
      marginTop: spacing.md,
      paddingBottom: spacing['3xl'],
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
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
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.semibold,
      color: colors.text,
      marginTop: spacing.sm,
      textAlign: 'center',
    },
    emptyDescription: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
      marginTop: spacing.sm,
      textAlign: 'center',
    },
    emptyButton: {
      marginTop: spacing.xl,
      minWidth: 200,
    },
  });
