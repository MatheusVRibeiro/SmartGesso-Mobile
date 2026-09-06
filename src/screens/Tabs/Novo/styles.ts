import { StyleSheet } from 'react-native';
import { typography, spacing, radius, sizes } from '@/src/theme';
import type { ActivePalette } from '@/src/theme/ThemeProvider';

export const createNovoStyles = (colors: ActivePalette, isDark: boolean) =>
  StyleSheet.create({
    header: {
      marginBottom: spacing.xl,
    },
    title: {
      fontSize: typography.sizes['2xl'],
      fontWeight: typography.weights.bold,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: spacing.md,
      maxWidth: 680,
      width: '100%',
      alignSelf: 'center',
    },
    actionButton: {
      width: '48%',
    },
    actionCard: {
      padding: spacing.lg,
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 140,
      justifyContent: 'center',
    },
    actionIconContainer: {
      width: 52,
      height: 52,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    actionTitle: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
      color: colors.text,
      textAlign: 'center',
    },
  });

import { colors as defaultColors } from '@/src/theme';
export const styles = createNovoStyles(defaultColors, false);
