import { StyleSheet } from 'react-native';
import { typography, spacing, radius, sizes } from '@/src/theme';
import type { ActivePalette } from '@/src/theme/ThemeProvider';

export const createLoginStyles = (colors: ActivePalette, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: spacing.md,
      paddingTop: spacing.xs,
    },
    themeToggleBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.border,
    },
    themeToggleText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    header: {
      alignItems: 'center',
      marginTop: spacing['2xl'],
      marginBottom: spacing['2xl'],
    },
    logoCircle: {
      width: 76,
      height: 76,
      borderRadius: 24,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.35 : 0.2,
      shadowRadius: 16,
      elevation: 6,
    },
    logo: {
      fontSize: typography.sizes['3xl'],
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.5,
      marginBottom: 2,
    },
    tagline: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontSize: typography.sizes.md,
      color: colors.textSecondary,
    },
    card: {
      alignSelf: 'center',
      width: '100%',
      maxWidth: 440,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    submitButton: {
      marginTop: spacing.lg,
      minHeight: 48,
    },
    forgotButton: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.md,
      minHeight: sizes.touchTarget,
    },
    forgotText: {
      fontSize: typography.sizes.sm,
      color: colors.primary,
      fontWeight: '600',
    },
    footerNote: {
      textAlign: 'center',
      fontSize: 11,
      color: colors.textLight,
      marginTop: spacing['2xl'],
      marginBottom: spacing.lg,
    },
  });

import { colors as defaultColors } from '@/src/theme';
export const styles = createLoginStyles(defaultColors, false);
