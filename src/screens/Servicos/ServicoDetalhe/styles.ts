import { StyleSheet } from 'react-native';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { typography, spacing, borders, radius, sizes } from '@/src/theme';

export const createServicoDetalheStyles = (colors: ActivePalette, isDark: boolean) => StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAction: {
    minWidth: sizes.touchTarget,
    minHeight: sizes.touchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  orderNumber: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInfo: {
    flex: 1,
  },
  rowLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  rowValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  sectionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  materialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  materialIcon: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  materialInfo: {
    flex: 1,
  },
  materialName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  materialQuantity: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  obsCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  obsText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.sizes.sm * 1.5,
  },
  resultCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  resultRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  resultInfo: {
    flex: 1,
  },
  resultLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  resultValue: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  resultValueSemibold: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  resultProfitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profitValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
  },
  marginText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  resultCtaButton: {
    marginBottom: spacing.lg,
  },
  // Central operacional (V3) — Prazo / Financeiro / Custos / Atalhos
  prazoCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  prazoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  prazoItem: {
    flex: 1,
  },
  prazoLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  prazoValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  prazoBadgeWrap: {
    marginTop: spacing.md,
    alignItems: 'flex-start',
  },
  financeiroCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  financeiroRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  financeiroItem: {
    flex: 1,
  },
  financeiroLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  financeiroValue: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  financeiroValueSemibold: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  financeiroHint: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    marginTop: spacing.sm,
  },
  custosCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  custosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  custosIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.warningSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  custosInfo: {
    flex: 1,
  },
  custosLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  custosValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  custosHint: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  shortcutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  shortcutItem: {
    width: '48%',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shortcutItemPressed: {
    backgroundColor: colors.primarySoft,
  },
  shortcutIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    textAlign: 'center',
  },
  // Ações rápidas (rota / ligar / WhatsApp)
  quickActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionPressed: {
    backgroundColor: colors.primarySoft,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  // Status expandido (timeline + transições)
  statusCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  statusStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusStepLabel: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  statusStepLabelCurrent: {
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  statusCurrentBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  statusCurrentBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  statusActions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  statusActionButton: {
    marginBottom: spacing.xs,
  },
  statusCancelledText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  // Checklist interativo
  checklistCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    minHeight: sizes.touchTarget,
    borderRadius: radius.sm,
  },
  checklistItemPressed: {
    backgroundColor: colors.primarySoft,
  },
  checklistItemLabel: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  checklistItemLabelChecked: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  checklistHint: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    marginTop: spacing.sm,
  },
  // Etapas do serviço (V3 §33) — timeline interativa
  etapasCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  etapaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    minHeight: sizes.touchTarget,
    borderRadius: radius.sm,
  },
  etapaRowPressed: {
    backgroundColor: colors.primarySoft,
  },
  etapaLabel: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  etapaLabelDone: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  etapaLabelCurrent: {
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  etapaBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  etapaBadgeDone: {
    backgroundColor: colors.successSoft,
  },
  etapaBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  etapaBadgeTextDone: {
    color: colors.success,
  },
  etapaHint: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    marginTop: spacing.sm,
  },
  // Produção opcional (V3 §44) — Sim/Não + link para ordem de produção
  producaoCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  producaoQuestion: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  producaoToggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  producaoToggleButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: borders.width.thin,
    borderColor: colors.border,
    minHeight: sizes.touchTarget,
  },
  producaoToggleButtonActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  producaoToggleButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  producaoToggleButtonTextActive: {
    color: colors.primary,
  },
  producaoLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    minHeight: sizes.touchTarget,
    borderRadius: radius.sm,
  },
  producaoLinkRowPressed: {
    backgroundColor: colors.primarySoft,
  },
  producaoLinkLabel: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  producaoHint: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  producaoCtaButton: {
    marginTop: spacing.sm,
  },
  // Fotos (antes / durante / depois) — PhotoPicker (V3 §67)
  photoSection: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  photoHint: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
  modalBody: {
    padding: sizes.screenPadding,
    paddingTop: spacing.lg,
  },
  modalConfirmButton: {
    marginTop: spacing.lg,
  },
  // Motivo da pausa/atraso (V3 §35) — exibição no card de Status
  pauseReasonBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.warningSoft,
  },
  pauseReasonInfo: {
    flex: 1,
    gap: 2,
  },
  pauseReasonLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.warning,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pauseReasonText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    lineHeight: typography.sizes.sm * 1.4,
  },
  // Modal de motivo (V3 §35) — chips + observação
  pauseModalHint: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  pauseReasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  pauseReasonChip: {
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
  pauseReasonChipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  pauseReasonChipPressed: {
    backgroundColor: colors.primarySoft,
  },
  pauseReasonChipText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  pauseReasonChipTextSelected: {
    color: colors.primary,
  },
  pauseObservationInput: {
    marginBottom: spacing.md,
  },
  pauseDateHint: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  // Prazo — botão de atraso (V3 §35)
  prazoLateButton: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
  // Pré-requisitos para início (V3 §34)
  prereqCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
});
