import { StyleSheet } from 'react-native';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { typography, spacing, radius, sizes } from '@/src/theme';

export const createObraDetalheStyles = (colors: ActivePalette, isDark: boolean) => StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerAction: {
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
  sectionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  // Header do perfil (hero)
  heroCard: {
    marginBottom: spacing.xs,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  heroTitle: {
    flex: 1,
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  heroText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  // Blocos navegáveis
  blockCard: {
    marginBottom: spacing.sm,
  },
  blockPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  blockPressed: {
    opacity: 0.7,
  },
  blockIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockInfo: {
    flex: 1,
    gap: 2,
  },
  blockTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  blockSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  // Informações
  infoCard: {
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  infoRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  editButton: {
    marginTop: spacing.xs,
  },
  // Formulário de edição
  clientField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    height: sizes.inputHeight,
    marginBottom: spacing.lg,
  },
  clientFieldError: {
    borderColor: colors.danger,
    borderWidth: 2,
  },
  clientFieldText: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  clientFieldPlaceholder: {
    color: colors.textLight,
  },
  fieldError: {
    fontSize: typography.sizes.xs,
    color: colors.danger,
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statusChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  statusChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusChipText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  statusChipTextSelected: {
    color: colors.textOnPrimary,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  cancelButton: {
    marginTop: spacing.xs,
  },
  // Modal de cliente
  modalSafe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sizes.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  modalClose: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSearch: {
    paddingHorizontal: sizes.screenPadding,
  },
  modalList: {
    padding: sizes.screenPadding,
    paddingTop: spacing.xs,
    paddingBottom: spacing['3xl'],
  },
  clientOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  clientOptionPressed: {
    opacity: 0.7,
  },
  clientOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientOptionInfo: {
    flex: 1,
  },
  clientOptionName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  clientOptionMeta: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
