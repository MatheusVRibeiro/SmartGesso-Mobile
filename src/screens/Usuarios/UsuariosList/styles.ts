import { StyleSheet } from 'react-native';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { typography, spacing, radius, sizes } from '@/src/theme';

export const createUsuariosStyles = (colors: ActivePalette, isDark: boolean) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: sizes.screenPadding,
      paddingTop: spacing.xs,
      paddingBottom: spacing.sm,
      gap: spacing.sm,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flex: 1,
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
    addButton: {
      width: 42,
      height: 42,
      borderRadius: radius.full,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    listContent: {
      padding: sizes.screenPadding,
      paddingTop: spacing.xs,
      paddingBottom: spacing['4xl'],
    },
    card: {
      marginBottom: spacing.md,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: radius.full,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.bold,
      color: colors.primary,
    },
    info: {
      flex: 1,
      gap: 2,
    },
    name: {
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.semibold,
      color: colors.text,
    },
    email: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
    },
    badges: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
  });
