/**
 * SmartGesso Mobile — Estilos compartilhados do wizard de orçamento.
 *
 * Extraído de app/(app)/orcamentos/novo.tsx (ETAPA 4) para que os
 * componentes de step e a tela compartilhem a mesma StyleSheet.
 */
import { StyleSheet } from 'react-native';
import { colors, radius, sizes, spacing, typography } from '../../../../theme';

export const styles = StyleSheet.create({
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
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  // Progresso
  progressWrap: {
    marginBottom: spacing.lg,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
  },
  progressLineActive: {
    backgroundColor: colors.primary,
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotCurrent: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  progressDotDone: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  progressNumber: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textLight,
  },
  progressNumberCurrent: {
    color: colors.textOnPrimary,
  },
  progressCaptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  progressCaption: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  // Etapa 1 — Cliente
  clientCard: {
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  clientCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  clientIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientInfo: {
    flex: 1,
  },
  clientLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  clientName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  clientChangeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  clientChangeButtonPressed: {
    opacity: 0.7,
  },
  clientChangeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  selectorField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: sizes.inputHeight,
    gap: spacing.sm,
  },
  selectorText: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  selectorPlaceholder: {
    color: colors.textLight,
  },
  // Etapa 2 — Local
  localRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  localFieldHalf: {
    flex: 1,
  },
  // Etapa 3 — Medições
  infoCard: {
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  measurementOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  measurementOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  measurementInfo: {
    flex: 1,
  },
  measurementName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  measurementMeta: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  selectionCount: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  // Etapa 4 — Serviço/Materiais
  compositionCard: {
    marginBottom: spacing.lg,
  },
  compositionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  compositionCode: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  compositionName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  materialCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  materialRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  materialInfo: {
    flex: 1,
  },
  materialName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  materialMeta: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    marginTop: 2,
  },
  materialQtyField: {
    width: 96,
  },
  materialQtyInput: {
    marginBottom: spacing.xs,
  },
  itemSubtotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  itemSubtotalLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  itemSubtotalValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  summaryCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryFieldsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  itemFieldHalf: {
    flex: 1,
  },
  summaryInput: {
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  summaryCost: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  totalRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  totalValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  recalculateButton: {
    marginBottom: spacing.sm,
  },
  // Etapa 4 — Serviço/Materiais
  serviceCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  itemLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  removeItemButton: {
    padding: spacing.xs,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  addItemButtonPressed: {
    opacity: 0.7,
  },
  addItemText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  // Etapa 7 — Pagamento
  paymentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  paymentChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  paymentChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  paymentChipText: {
    fontSize: typography.sizes.xs,
    color: colors.text,
  },
  paymentChipTextSelected: {
    color: colors.textOnPrimary,
  },
  // Etapa 6 — Prazo
  computedDateBox: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    marginBottom: spacing.lg,
  },
  computedDateLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  computedDateValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  // Etapa 8 — Revisão
  reviewCard: {
    marginBottom: spacing.md,
  },
  reviewSectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  reviewValue: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  reviewMeta: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  reviewDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  reviewItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  reviewItemName: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  reviewItemQty: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  // Erro da etapa + rodapé de navegação
  stepErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
  },
  stepErrorText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.error,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginBottom: spacing['3xl'],
  },
  footerButton: {
    flex: 1,
  },
  // Modal styles
  modalSafe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sizes.screenPadding,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  modalClose: {
    padding: spacing.xs,
  },
  modalSearch: {
    padding: sizes.screenPadding,
    paddingBottom: spacing.sm,
  },
  modalList: {
    padding: sizes.screenPadding,
    paddingBottom: spacing['3xl'],
  },
  clientOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: spacing.sm,
    marginBottom: spacing.xs,
    backgroundColor: colors.card,
  },
  clientOptionPressed: {
    opacity: 0.7,
  },
  clientOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
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
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modalBody: {
    flex: 1,
  },
  modalFooter: {
    padding: sizes.screenPadding,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  // Cadastro rápido de cliente (V3 §12)
  quickForm: {
    padding: sizes.screenPadding,
    paddingBottom: spacing['3xl'],
  },
  quickFormHint: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  quickFormSection: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  quickFormRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickFormFieldHalf: {
    flex: 1,
  },
  quickFormSubmit: {
    marginTop: spacing.sm,
  },
  // Etapa 3 — Ambientes
  environmentCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  environmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  environmentNameField: {
    flex: 1,
  },
  removeEnvironmentButton: {
    padding: spacing.xs,
  },
  environmentSectionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  applicationTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  applicationTypeChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  applicationTypeChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  applicationTypeChipText: {
    fontSize: typography.sizes.xs,
    color: colors.text,
  },
  applicationTypeChipTextSelected: {
    color: colors.textOnPrimary,
  },
  environmentMeasurementRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  environmentMeasurementField: {
    flex: 1,
  },
});
