import { StyleSheet } from 'react-native';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { typography, spacing, borders, radius, sizes } from '@/src/theme';

export const createMedicaoDetalheStyles = (colors: ActivePalette, isDark: boolean) => StyleSheet.create({
  screen: {
    flex: 1,
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
  title: {
    flex: 1,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  headerAction: {
    minWidth: sizes.touchTarget,
    minHeight: sizes.touchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  infoTitle: {
    flex: 1,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.divider,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  field: {
    gap: spacing.xs,
  },
  fieldLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  fieldValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  editButton: {
    marginBottom: spacing['3xl'],
  },
  sectionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  typeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  typeChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeChipText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  typeChipTextSelected: {
    color: colors.textOnPrimary,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rowField: {
    flex: 1,
  },
  feedbackCard: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  feedbackDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.divider,
  },
  feedbackLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  feedbackValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  feedbackEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  feedbackHint: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  feedbackNote: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: borders.width.thin,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  toggleLabel: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  observationsLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  observationsInput: {
    backgroundColor: colors.inputBackground,
    borderWidth: borders.width.thin,
    borderColor: colors.inputBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 96,
    fontSize: typography.sizes.md,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  cancelButton: {
    marginTop: spacing.sm,
    marginBottom: spacing['3xl'],
  },
});
