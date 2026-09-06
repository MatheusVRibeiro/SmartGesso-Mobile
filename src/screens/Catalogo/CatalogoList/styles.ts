import { StyleSheet } from 'react-native';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { typography, spacing, radius, sizes } from '@/src/theme';

export const createCatalogoStyles = (colors: ActivePalette, isDark: boolean) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.md,
      paddingTop: spacing.xs,
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
      marginTop: 2,
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
    },
    tabsScroll: {
      flexDirection: 'row',
      gap: spacing.xs,
      paddingBottom: spacing.md,
    },
    tabPill: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 2,
      borderRadius: radius.full,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    tabPillActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    tabPillText: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.medium,
      color: colors.textSecondary,
    },
    tabPillTextActive: {
      color: colors.textOnPrimary ?? '#FFFFFF',
      fontWeight: typography.weights.semibold,
    },
    badgeCount: {
      paddingHorizontal: 6,
      paddingVertical: 1,
      borderRadius: radius.full,
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
    },
    badgeCountActive: {
      backgroundColor: 'rgba(255,255,255,0.25)',
    },
    badgeCountText: {
      fontSize: 11,
      fontWeight: typography.weights.bold,
      color: colors.textSecondary,
    },
    badgeCountTextActive: {
      color: colors.textOnPrimary ?? '#FFFFFF',
    },
    cardsContainer: {
      gap: spacing.md,
      paddingBottom: spacing['4xl'],
    },
    cardPressed: {
      opacity: 0.85,
    },
    card: {
      padding: spacing.lg,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: radius.lg,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    countContainer: {
      alignItems: 'flex-end',
    },
    countValue: {
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.bold,
      color: colors.text,
    },
    countLabel: {
      fontSize: typography.sizes.xs,
      color: colors.textSecondary,
    },
    cardTitle: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.semibold,
      color: colors.text,
    },
    cardDescription: {
      marginTop: spacing.xs,
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
    },
    cardFooter: {
      marginTop: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    cardAction: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
      color: colors.primary,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
      marginTop: spacing.xs,
    },
    sectionTitle: {
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.semibold,
      color: colors.text,
    },
    sectionAction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    sectionActionText: {
      fontSize: typography.sizes.sm,
      color: colors.primary,
      fontWeight: typography.weights.semibold,
    },
    itemsList: {
      gap: spacing.sm,
      paddingBottom: spacing['4xl'],
    },
    itemCard: {
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
    },
    itemCardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    itemCardMain: {
      flex: 1,
    },
    itemName: {
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.semibold,
      color: colors.text,
      marginBottom: 2,
    },
    itemMeta: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
    },
    itemPrice: {
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.bold,
      color: colors.primary,
      textAlign: 'right',
    },
    itemRight: {
      alignItems: 'flex-end',
      gap: spacing.xs,
    },
  });
