import { StyleSheet } from 'react-native';
import { typography, spacing, radius, sizes } from '@/src/theme';
import type { ActivePalette } from '@/src/theme/ThemeProvider';

export const createClientesListStyles = (colors: ActivePalette, isDark: boolean) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    title: {
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.bold,
      color: colors.text,
    },
    addButton: {
      width: 44,
      height: 44,
      borderRadius: radius.full,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
    listContent: {
      paddingBottom: spacing['3xl'],
      maxWidth: 680,
      width: '100%',
      alignSelf: 'center',
    },
    card: {
      marginBottom: spacing.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    cardLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    cardIcon: {
      width: 42,
      height: 42,
      borderRadius: radius.full,
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
    cardName: {
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
    cardRowText: {
      flex: 1,
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
    },
  });

import { colors as defaultColors } from '@/src/theme';
export const styles = createClientesListStyles(defaultColors, false);
