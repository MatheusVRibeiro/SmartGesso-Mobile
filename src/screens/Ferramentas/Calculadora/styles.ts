import { StyleSheet } from 'react-native';
import { typography, spacing, radius, sizes } from '@/src/theme';
import type { ActivePalette } from '@/src/theme/ThemeProvider';

export const createCalculadoraStyles = (colors: ActivePalette, isDark: boolean) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    responsiveContainer: {
      maxWidth: 680,
      width: '100%',
      alignSelf: 'center',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    backButton: {
      minWidth: sizes.touchTarget,
      minHeight: sizes.touchTarget,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitleBox: {
      flex: 1,
    },
    title: {
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.bold,
      color: colors.text,
    },
    subtitle: {
      fontSize: typography.sizes.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    sectionLabel: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    appsScroll: {
      gap: spacing.sm,
      paddingBottom: spacing.xs,
    },
    appCard: {
      width: 124,
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    appCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primarySoft,
    },
    appIconBox: {
      width: 44,
      height: 44,
      borderRadius: radius.full,
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.primarySoft,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    appIconBoxSelected: {
      backgroundColor: colors.primary,
    },
    appLabel: {
      fontSize: typography.sizes.xs,
      fontWeight: typography.weights.semibold,
      color: colors.text,
      textAlign: 'center',
    },
    appLabelSelected: {
      color: colors.primary,
      fontWeight: typography.weights.bold,
    },
    card: {
      padding: spacing.md,
      marginBottom: spacing.sm,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    row: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    col: {
      flex: 1,
    },
    halfCol: {
      flex: 1,
    },
    measurementSummary: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.background,
      borderRadius: radius.md,
      padding: spacing.sm,
      marginTop: spacing.xs,
      borderWidth: 1,
      borderColor: colors.border,
    },
    measurementItem: {
      alignItems: 'center',
    },
    measurementLabel: {
      fontSize: typography.sizes.xs,
      color: colors.textLight,
    },
    measurementValue: {
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.bold,
      color: colors.text,
      marginTop: 2,
    },
    resultHeroCard: {
      padding: spacing.lg,
      backgroundColor: colors.surface,
      borderColor: colors.primary,
      borderWidth: 1.5,
      borderRadius: radius.xl,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    heroHeader: {
      alignItems: 'center',
    },
    heroLabel: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    heroValue: {
      fontSize: typography.sizes['3xl'],
      fontWeight: typography.weights.bold,
      color: colors.primary,
      marginTop: spacing.xs,
    },
    heroDivider: {
      height: 1,
      backgroundColor: colors.divider,
      marginVertical: spacing.md,
    },
    heroDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    heroDetailCol: {
      alignItems: 'center',
    },
    heroDetailLabel: {
      fontSize: typography.sizes.xs,
      color: colors.textLight,
    },
    heroDetailValue: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.bold,
      color: colors.text,
      marginTop: 2,
    },
    materialsCard: {
      padding: spacing.md,
      marginBottom: spacing.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    materialRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
    },
    materialRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    materialInfo: {
      flex: 1,
      marginRight: spacing.sm,
    },
    materialName: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.medium,
      color: colors.text,
    },
    materialUnitPrice: {
      fontSize: typography.sizes.xs,
      color: colors.textLight,
      marginTop: 2,
    },
    materialQtyCol: {
      alignItems: 'flex-end',
    },
    materialQty: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.bold,
      color: colors.primary,
    },
    materialTotal: {
      fontSize: typography.sizes.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    actionButtons: {
      gap: spacing.sm,
      marginTop: spacing.md,
      marginBottom: spacing['2xl'],
    },
    whatsAppBtn: {
      backgroundColor: colors.success,
    },
    officialQuoteBtn: {
      borderColor: colors.primary,
    },
  });

import { colors as defaultColors } from '@/src/theme';
export const styles = createCalculadoraStyles(defaultColors, false);
