import { StyleSheet } from 'react-native';
import { typography, spacing, radius, sizes } from '@/src/theme';
import type { ActivePalette } from '@/src/theme/ThemeProvider';

export const createMaisStyles = (colors: ActivePalette, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      marginBottom: spacing.xl,
    },
    title: {
      fontSize: typography.sizes['2xl'],
      fontWeight: typography.weights.bold,
      color: colors.text,
    },
    subtitle: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
      marginTop: 2,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontSize: typography.sizes.xs,
      fontWeight: typography.weights.semibold,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: spacing.sm,
      marginLeft: spacing.xs,
    },
    sectionCard: {
      padding: 0,
      overflow: 'hidden',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      minHeight: 52,
    },
    menuItemBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    menuItemContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    menuItemIcon: {
      width: 40,
      height: 40,
      borderRadius: radius.full,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuItemTitle: {
      fontSize: typography.sizes.md,
      color: colors.text,
      fontWeight: '500',
    },
    badge: {
      minWidth: 22,
      height: 22,
      borderRadius: radius.full,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xs,
    },
    badgeText: {
      fontSize: typography.sizes.xs,
      fontWeight: typography.weights.bold,
      color: colors.white,
    },
    logoutIcon: {
      backgroundColor: colors.dangerSoft,
      borderColor: colors.dangerSoft,
    },
    logoutTitle: {
      color: colors.danger,
      fontWeight: typography.weights.semibold,
    },
  });

import { colors as defaultColors } from '@/src/theme';
export const styles = createMaisStyles(defaultColors, false);
