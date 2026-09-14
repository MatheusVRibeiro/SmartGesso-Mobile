import { Platform, StyleSheet } from 'react-native';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { typography, spacing, radius, sizes } from '@/src/theme';

export const createNotificacoesStyles = (colors: ActivePalette, isDark: boolean) =>
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
    },
    header: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xs,
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
    // Botão de ação discreto no topo direito da barra
    headerMarkAllBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: 6,
      borderRadius: radius.full,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(30, 64, 175, 0.08)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
    },
    headerMarkAllBtnPressed: {
      opacity: 0.7,
    },
    headerMarkAllText: {
      fontSize: 12,
      fontWeight: typography.weights.medium,
      color: isDark ? colors.textSecondary : colors.primary,
    },
    // ─── Filter Chips (Barra horizontal deslizável) ──────────────────────
    filtersScrollContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
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
    // ─── List Content ───────────────────────────────────────────────────
    list: {
      flex: 1,
      width: '100%',
    },
    listContent: {
      paddingBottom: spacing['5xl'],
      flexGrow: 1,
    },
    sectionHeaderWrapper: {
      paddingHorizontal: spacing.lg,
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
    },
    sectionHeader: {
      fontSize: 11,
      fontWeight: typography.weights.bold,
      color: colors.textLight,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    // ─── Cards ──────────────────────────────────────────────────────────
    cardWrapper: {
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.sm,
    },
    card: {
      padding: spacing.md,
      borderRadius: radius.xl,
      backgroundColor: colors.surface,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.07)' : colors.border,
      borderWidth: 1,
    },
    cardUnread: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.surface,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : colors.border,
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
    },
    cardIcon: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardInfo: {
      flex: 1,
      gap: 4,
    },
    cardTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    cardTitleAndBadge: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    cardTitle: {
      fontSize: typography.sizes.sm + 1,
      fontWeight: typography.weights.bold,
      color: colors.text,
    },
    unreadDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: isDark ? '#60A5FA' : colors.primary,
    },
    cardDate: {
      fontSize: 11,
      color: colors.textLight,
      fontWeight: typography.weights.medium,
    },
    cardDescription: {
      fontSize: typography.sizes.xs + 1,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    cardActionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.xs,
      paddingTop: spacing.xs + 2,
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.divider,
    },
    actionCtaButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radius.md,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.inputBackground,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
    },
    actionCtaText: {
      fontSize: 11,
      fontWeight: typography.weights.medium,
      color: isDark ? colors.text : colors.textSecondary,
    },
    markReadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      paddingHorizontal: spacing.xs,
      paddingVertical: 3,
    },
    markReadText: {
      fontSize: 11,
      fontWeight: typography.weights.medium,
      color: colors.textLight,
    },
  });
