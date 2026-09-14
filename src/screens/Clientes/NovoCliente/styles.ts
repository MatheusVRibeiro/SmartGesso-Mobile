import { Platform, StyleSheet } from 'react-native';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { typography, spacing, radius, sizes } from '@/src/theme';

export const createNovoClienteStyles = (colors: ActivePalette, isDark: boolean) =>
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
      maxWidth: Platform.OS === 'web' ? 820 : undefined,
    },
    scrollContent: {
      paddingBottom: spacing['5xl'],
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.sm,
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
      marginTop: 2,
      fontSize: typography.sizes.xs,
      color: colors.textSecondary,
    },
    // ─── Card Section ───────────────────────────────────────────────────
    cardSection: {
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.md,
    },
    formCard: {
      padding: spacing.lg,
      borderRadius: radius.xl,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
      gap: spacing.md,
    },
    cardSectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.divider,
    },
    cardSectionTitleGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    cardSectionTitle: {
      fontSize: typography.sizes.xs + 1,
      fontWeight: typography.weights.bold,
      color: colors.text,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    cardSectionBadge: {
      fontSize: 10,
      fontWeight: typography.weights.medium,
      color: colors.textLight,
    },
    // ─── Tipo de Cliente ────────────────────────────────────────────────
    typeRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    typeButton: {
      flex: 1,
      height: 42,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : colors.inputBackground,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    typeButtonSelected: {
      backgroundColor: isDark ? 'rgba(94, 106, 210, 0.18)' : 'rgba(30, 64, 175, 0.08)',
      borderColor: isDark ? '#8B93E6' : colors.primary,
    },
    typeButtonText: {
      fontSize: typography.sizes.xs + 1,
      fontWeight: typography.weights.medium,
      color: colors.textSecondary,
    },
    typeButtonTextSelected: {
      color: isDark ? '#8B93E6' : colors.primary,
      fontWeight: typography.weights.bold,
    },
    // ─── WhatsApp Quick Copy ────────────────────────────────────────────
    whatsappHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 2,
    },
    copyPhoneChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: radius.full,
      backgroundColor: isDark ? 'rgba(37, 211, 102, 0.12)' : '#ECFDF5',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(37, 211, 102, 0.25)' : '#A7F3D0',
    },
    copyPhoneChipText: {
      fontSize: 11,
      fontWeight: typography.weights.semibold,
      color: isDark ? '#4ADE80' : '#059669',
    },
    // ─── Grid Rows ──────────────────────────────────────────────────────
    gridRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    gridCol: {
      flex: 1,
    },
    gridColNarrow: {
      width: 110,
    },
    // ─── Observations ───────────────────────────────────────────────────
    fieldGroup: {
      gap: spacing.xs,
    },
    label: {
      fontSize: typography.sizes.xs + 1,
      fontWeight: typography.weights.semibold,
      color: colors.text,
    },
    observationsInput: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.inputBackground,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      minHeight: 88,
      fontSize: typography.sizes.sm,
      color: colors.text,
      textAlignVertical: 'top',
    },
    // ─── Footer Actions ─────────────────────────────────────────────────
    actionsWrapper: {
      paddingHorizontal: spacing.lg,
      marginTop: spacing.sm,
      marginBottom: spacing['4xl'],
      gap: spacing.sm,
    },
    cancelButton: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
    },
    cancelButtonText: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.medium,
      color: colors.textSecondary,
    },
  });
