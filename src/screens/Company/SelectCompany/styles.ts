import { StyleSheet } from 'react-native';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { typography, spacing, radius, sizes, shadows } from '@/src/theme';

export const createSelectCompanyStyles = (colors: ActivePalette, isDark: boolean) =>
  StyleSheet.create({
    header: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: spacing.md,
    },
    headerTitle: {
      fontSize: typography.sizes['2xl'],
      fontWeight: typography.weights.bold,
      color: colors.text,
      letterSpacing: -0.5,
    },
    headerSubtitle: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    listContent: {
      padding: spacing.md,
    },
    cardPressable: {
      minHeight: sizes.touchTarget,
      marginBottom: spacing.md,
    },
    cardPressed: {
      opacity: 0.92,
    },
    card: {
      position: 'relative',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
    },
    cardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primarySoft,
    },
    cardBlocked: {
      opacity: 0.6,
    },
    cardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    cardIcon: {
      width: 44,
      height: 44,
      borderRadius: radius.lg,
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
    companyName: {
      flex: 1,
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.semibold,
      color: colors.text,
    },
    companyDocument: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
    },
    ownerBadge: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    ownerText: {
      fontSize: typography.sizes.xs,
      color: colors.warning,
      marginLeft: spacing.xs,
      fontWeight: typography.weights.medium,
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorBanner: {
      backgroundColor: colors.dangerSoft,
      padding: spacing.md,
      borderRadius: radius.md,
      marginBottom: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    errorText: {
      color: colors.danger,
      fontSize: typography.sizes.sm,
      flex: 1,
      marginRight: spacing.md,
    },
  });
