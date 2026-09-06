import { StyleSheet } from 'react-native';
import { typography, spacing, radius, sizes } from '@/src/theme';
import type { ActivePalette } from '@/src/theme/ThemeProvider';

export const createServicosStyles = (colors: ActivePalette, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerWrapper: {
      paddingHorizontal: sizes.screenPadding,
      paddingTop: spacing.md,
      paddingBottom: spacing.xs,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    title: {
      fontSize: typography.sizes['2xl'],
      fontWeight: typography.weights.bold,
      color: colors.text,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      height: 44,
      marginBottom: spacing.sm,
      gap: spacing.sm,
    },
    searchInput: {
      flex: 1,
      fontSize: typography.sizes.sm,
      color: colors.text,
      height: '100%',
    },
    filterScroll: {
      flexDirection: 'row',
      gap: spacing.xs,
      paddingBottom: spacing.xs,
    },
    filterChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: radius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterChipText: {
      fontSize: typography.sizes.xs,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    filterChipTextActive: {
      color: '#FFFFFF',
    },
    listContent: {
      padding: sizes.screenPadding,
      paddingTop: spacing.sm,
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
    cardPressable: {
      gap: spacing.sm,
    },
    cardPressed: {
      opacity: 0.7,
    },
    cardContent: {
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
    cardTitle: {
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
    cardText: {
      flex: 1,
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
    },
    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.xs,
    },
    cardDate: {
      fontSize: typography.sizes.xs,
      color: colors.textLight,
    },
    cardMaterials: {
      fontSize: typography.sizes.xs,
      color: colors.textSecondary,
      fontWeight: '500',
    },
  });

import { colors as defaultColors } from '@/src/theme';
export const styles = createServicosStyles(defaultColors, false);
