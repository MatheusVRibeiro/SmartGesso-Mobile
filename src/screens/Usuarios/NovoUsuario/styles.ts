import { StyleSheet } from 'react-native';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { colors, typography, spacing, radius, sizes } from '@/src/theme';

export const createNovoUsuarioStyles = (colors: ActivePalette, isDark: boolean) => StyleSheet.create({
  content: {
    flex: 1,
    gap: spacing.md,
  },
  iconCircle: {
    width: sizes.iconCircle,
    height: sizes.iconCircle,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
  },
  description: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  field: {
    marginBottom: spacing.xs,
  },
  rolesSection: {
    gap: spacing.sm,
  },
  rolesLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: sizes.touchTarget,
  },
  roleChipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  roleChipPressed: {
    backgroundColor: colors.primarySoft,
  },
  roleChipText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  roleChipTextSelected: {
    color: colors.primary,
  },
  submitButton: {
    marginTop: spacing.lg,
  },
});
