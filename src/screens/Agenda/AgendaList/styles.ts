import { StyleSheet } from 'react-native';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { typography, spacing, radius, sizes } from '@/src/theme';

export const createAgendaStyles = (colors: ActivePalette, isDark: boolean) =>
  StyleSheet.create({
    header: {
      paddingHorizontal: sizes.screenPadding,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
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
    filters: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: sizes.screenPadding,
      paddingTop: spacing.xs,
      paddingBottom: spacing.sm,
    },
    chip: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      borderWidth: 1,
    },
    chipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipUnselected: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    chipText: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
    },
    chipTextSelected: {
      color: colors.textOnPrimary,
    },
    chipTextUnselected: {
      color: colors.textSecondary,
    },
    listContent: {
      padding: sizes.screenPadding,
      paddingTop: spacing.xs,
      paddingBottom: spacing['4xl'],
    },
    sectionHeader: {
      fontSize: typography.sizes.xs,
      fontWeight: typography.weights.bold,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: spacing.sm,
      marginTop: spacing.md,
      marginLeft: spacing.xs,
    },
    card: {
      marginBottom: spacing.md,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
    },
    cardPressable: {
      gap: spacing.sm,
    },
    cardPressed: {
      opacity: 0.8,
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    cardTime: {
      minWidth: 48,
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.bold,
      color: colors.primary,
    },
    cardIcon: {
      width: 42,
      height: 42,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardInfo: {
      flex: 1,
      gap: spacing.xs,
    },
    cardTitle: {
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.semibold,
      color: colors.text,
    },
    cardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    cardText: {
      flex: 1,
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
    },
    cardReference: {
      fontSize: typography.sizes.xs,
      color: colors.textSecondary,
    },
  });
