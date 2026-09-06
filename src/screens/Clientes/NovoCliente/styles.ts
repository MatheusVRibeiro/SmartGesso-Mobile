import { StyleSheet } from 'react-native';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { typography, spacing, borders, radius, sizes } from '@/src/theme';

export const createNovoClienteStyles = (colors: ActivePalette, isDark: boolean) =>
  StyleSheet.create({
    sectionTitle: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.bold,
      color: colors.text,
      marginTop: spacing.xl,
      marginBottom: spacing.xs,
    },
    sectionSubtitle: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
      marginBottom: spacing.md,
    },
    header: {
      marginBottom: spacing.xl,
      paddingTop: spacing.md,
    },
    title: {
      fontSize: typography.sizes['2xl'],
      fontWeight: typography.weights.bold,
      color: colors.text,
      letterSpacing: -0.5,
    },
    subtitle: {
      marginTop: 2,
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
    },
    fieldGroup: {
      marginBottom: spacing.lg,
    },
    label: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.medium,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    typeRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    typeButton: {
      flex: 1,
      height: sizes.inputHeight,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    typeButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    typeButtonText: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
      color: colors.text,
    },
    typeButtonTextSelected: {
      color: colors.textOnPrimary,
    },
    observationsInput: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      minHeight: 96,
      fontSize: typography.sizes.md,
      color: colors.text,
      textAlignVertical: 'top',
    },
    submitButton: {
      marginTop: spacing.sm,
      marginBottom: spacing['3xl'],
    },
  });
