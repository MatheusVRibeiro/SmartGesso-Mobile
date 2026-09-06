import { StyleSheet } from 'react-native';
import { typography, spacing, radius } from '@/src/theme';
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
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
      minHeight: 140,
      justifyContent: 'center',
    },
    actionIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 14,
      backgroundColor: isDark ? '#1C1F28' : 'rgba(99, 102, 241, 0.08)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(99, 102, 241, 0.15)',
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
