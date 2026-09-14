import { Platform, StyleSheet } from 'react-native';
import { typography, spacing, radius, sizes } from '@/src/theme';
import type { ActivePalette } from '@/src/theme/ThemeProvider';

export const createClientesListStyles = (colors: ActivePalette, isDark: boolean) =>
  StyleSheet.create({
    outerContainer: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    innerContainer: {
      flex: 1,
      width: '100%',
      maxWidth: Platform.OS === 'web' ? 880 : undefined,
    },
    headerWrapper: {
      width: '100%',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.sm,
      gap: spacing.sm,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      flex: 1,
    },
    headerTitles: {
      flex: 1,
    },
    title: {
      fontSize: typography.sizes['2xl'],
      fontWeight: typography.weights.bold,
      color: colors.text,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: typography.sizes.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.md,
      height: 38,
      borderRadius: radius.lg,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.4 : 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    addButtonText: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
      color: '#FFFFFF',
    },
    // ─── Dashboard Metrics ──────────────────────────────────────────────
    metricsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    metricCard: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.surface,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
      borderRadius: radius.xl,
      padding: spacing.md,
      gap: 3,
    },
    metricHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    metricLabel: {
      fontSize: 11,
      fontWeight: typography.weights.semibold,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    metricValue: {
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.bold,
      color: colors.text,
      marginTop: 2,
    },
    metricSub: {
      fontSize: 11,
      color: colors.textLight,
    },
    // ─── Search Bar ─────────────────────────────────────────────────────
    searchContainer: {
      width: '100%',
    },
    // ─── Filter Chips (Scroll horizontal) ───────────────────────────────
    filtersScrollContent: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xs,
      gap: spacing.xs,
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      borderRadius: radius.full,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.inputBackground,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
      gap: 6,
    },
    filterChipActive: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.14)' : colors.text,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.25)' : colors.text,
    },
    filterChipText: {
      fontSize: typography.sizes.xs,
      fontWeight: typography.weights.medium,
      color: colors.textSecondary,
    },
    filterChipTextActive: {
      color: colors.white,
      fontWeight: typography.weights.semibold,
    },
    filterBadge: {
      paddingHorizontal: 6,
      paddingVertical: 1,
      borderRadius: radius.full,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    filterBadgeActive: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.25)',
    },
    filterBadgeText: {
      fontSize: 10,
      fontWeight: typography.weights.bold,
      color: colors.textSecondary,
    },
    filterBadgeTextActive: {
      color: colors.white,
    },
    // ─── List ───────────────────────────────────────────────────────────
    list: {
      flex: 1,
      width: '100%',
    },
    listContent: {
      paddingBottom: spacing['5xl'],
      flexGrow: 1,
    },
    cardWrapper: {
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.sm,
    },
    card: {
      padding: spacing.md,
      borderRadius: radius.xl,
      backgroundColor: colors.surface,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
      borderWidth: 1,
    },
    cardMainPressable: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: typography.sizes.sm + 1,
      fontWeight: typography.weights.bold,
    },
    cardInfo: {
      flex: 1,
      gap: 4,
    },
    cardHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.xs,
    },
    cardName: {
      flex: 1,
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.bold,
      color: colors.text,
    },
    typeBadge: {
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: radius.full,
    },
    typeBadgeText: {
      fontSize: 10,
      fontWeight: typography.weights.bold,
      textTransform: 'uppercase',
    },
    cardMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flexWrap: 'wrap',
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaText: {
      fontSize: typography.sizes.xs,
      color: colors.textSecondary,
    },
    // ─── Actions Bar ────────────────────────────────────────────────────
    cardActionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.sm,
      paddingTop: spacing.xs + 2,
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.divider,
      gap: spacing.xs,
      flexWrap: 'wrap',
    },
    quickActionsGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    whatsappButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: 5,
      borderRadius: radius.md,
      backgroundColor: isDark ? 'rgba(37, 211, 102, 0.12)' : '#ECFDF5',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(37, 211, 102, 0.25)' : '#A7F3D0',
    },
    whatsappButtonText: {
      fontSize: 11,
      fontWeight: typography.weights.semibold,
      color: isDark ? '#4ADE80' : '#059669',
    },
    callButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: 5,
      borderRadius: radius.md,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.inputBackground,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
    },
    callButtonText: {
      fontSize: 11,
      fontWeight: typography.weights.medium,
      color: colors.textSecondary,
    },
    quoteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: 5,
      borderRadius: radius.md,
      backgroundColor: isDark ? 'rgba(94, 106, 210, 0.12)' : 'rgba(30, 64, 175, 0.08)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(94, 106, 210, 0.25)' : 'rgba(30, 64, 175, 0.15)',
    },
    quoteButtonText: {
      fontSize: 11,
      fontWeight: typography.weights.semibold,
      color: isDark ? '#8B93E6' : colors.primary,
    },
    viewDetailLink: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      paddingVertical: 4,
    },
    viewDetailText: {
      fontSize: 11,
      fontWeight: typography.weights.medium,
      color: colors.textLight,
    },
  });

import { colors as defaultColors } from '@/src/theme';
export const styles = createClientesListStyles(defaultColors, false);
