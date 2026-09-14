import { StyleSheet } from 'react-native';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { typography, spacing, radius, sizes } from '@/src/theme';

export const createProfileStyles = (colors: ActivePalette, isDark: boolean) =>
  StyleSheet.create({
    avatarContainer: {
      alignItems: 'center',
      marginTop: spacing.lg,
      marginBottom: spacing.lg,
    },
    avatar: {
      width: 76,
      height: 76,
      borderRadius: radius.full,
      backgroundColor: colors.primarySoft,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.primary,
    },
    avatarText: {
      fontSize: typography.sizes['2xl'],
      fontWeight: typography.weights.bold,
      color: colors.primary,
    },
    userInfo: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    userName: {
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.bold,
      color: colors.text,
      textAlign: 'center',
    },
    userEmail: {
      fontSize: typography.sizes.md,
      color: colors.textSecondary,
      marginTop: spacing.xs,
      textAlign: 'center',
    },
    infoCard: {
      padding: spacing.lg,
      marginBottom: spacing.lg,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    cardIcon: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardHeaderInfo: {
      flex: 1,
    },
    cardTitle: {
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.semibold,
      color: colors.text,
    },
    cardSubtitle: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
      marginTop: 2,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.md,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },
    infoRowIcon: {
      width: 32,
      height: 32,
      borderRadius: radius.sm,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    infoLabel: {
      flex: 1,
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
    },
    infoValue: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.medium,
      color: colors.text,
    },
    sectionLabel: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
      color: colors.textSecondary,
      marginTop: spacing.xs,
      marginBottom: spacing.sm,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    actionsSection: {
      marginTop: spacing.md,
      gap: spacing.md,
      paddingBottom: spacing['3xl'],
    },
    actionButton: {
      width: '100%',
    },
  });
