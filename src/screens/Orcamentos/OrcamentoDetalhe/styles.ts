import { StyleSheet } from 'react-native';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { typography, spacing, radius, shadows, sizes } from '@/src/theme';

export const createOrcamentoDetalheStyles = (colors: ActivePalette, isDark: boolean) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: sizes.screenPadding,
      paddingTop: spacing.xs,
      paddingBottom: spacing['4xl'],
      maxWidth: 680,
      width: '100%',
      alignSelf: 'center',
    },

    // ── Cabeçalho Integrado e Limpo ──────────────────────────────
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      marginBottom: 10,
      gap: 10,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
    },
    backButton: {
      width: 38,
      height: 38,
      borderRadius: radius.full,
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : colors.divider,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleGroup: {
      flex: 1,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },
    title: {
      fontSize: 19,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.4,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    headerIconBtn: {
      width: 38,
      height: 38,
      borderRadius: radius.full,
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : colors.avatarBackground,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(59, 130, 246, 0.28)' : colors.avatarBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerIconBtnPressed: {
      opacity: 0.75,
    },

    // ── Card de Contexto (Cliente & Obra) ────────────────────────
    clientCard: {
      padding: 14,
      marginBottom: 12,
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 10,
    },
    clientTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    clientAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark ? colors.avatarBackground : colors.avatarBackground,
      borderWidth: 1,
      borderColor: isDark ? colors.avatarBorder : colors.avatarBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    clientAvatarText: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.primary,
    },
    clientMainInfo: {
      flex: 1,
    },
    clientName: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.2,
    },
    clientDocument: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    clientMetaGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
    },
    metaChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 8,
      paddingVertical: 3.5,
      borderRadius: radius.full,
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.background,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border,
    },
    metaChipText: {
      fontSize: 11,
      color: colors.textSecondary,
      fontWeight: '500',
    },

    // ── Seção de Itens Unificada ──────────────────────────────────
    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 10,
      marginBottom: 6,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    sectionCountBadge: {
      paddingHorizontal: 7,
      paddingVertical: 1.5,
      borderRadius: radius.full,
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : colors.divider,
    },
    sectionCountText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    itemsCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      marginBottom: 12,
    },
    itemRow: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
      gap: 4,
    },
    itemRowLast: {
      borderBottomWidth: 0,
    },
    itemMainRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 10,
    },
    itemName: {
      flex: 1,
      fontSize: 13.5,
      fontWeight: '600',
      color: colors.text,
      lineHeight: 18,
    },
    itemTotal: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    itemSubRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    itemUnitTag: {
      fontSize: 11.5,
      color: colors.textSecondary,
    },
    emptyItemsBox: {
      padding: spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      fontSize: 13,
      color: colors.textSecondary,
    },

    // ── Resumo Financeiro Consolidado ─────────────────────────────
    summaryCard: {
      padding: 14,
      marginBottom: 12,
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 7,
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    summaryLabel: {
      fontSize: 12.5,
      color: colors.textSecondary,
    },
    summaryValue: {
      fontSize: 12.5,
      fontWeight: '600',
      color: colors.text,
    },
    discountValue: {
      color: colors.danger,
      fontWeight: '700',
    },
    totalBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginTop: 4,
      borderRadius: radius.lg,
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.12)' : colors.avatarBackground,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(59, 130, 246, 0.25)' : colors.avatarBorder,
    },
    totalLabel: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    totalValue: {
      fontSize: 19,
      fontWeight: '800',
      color: colors.primary,
      letterSpacing: -0.4,
    },
    paymentMethodRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 5,
    },
    paymentMethodChip: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: radius.md,
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.divider,
    },
    paymentMethodText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
    },

    // ── Observações & Histórico ───────────────────────────────────
    obsCard: {
      padding: 14,
      marginBottom: 12,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    obsText: {
      fontSize: 12.5,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    historyCard: {
      padding: 14,
      marginBottom: 12,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    historyItem: {
      flexDirection: 'row',
      gap: 10,
      paddingVertical: 5,
    },
    historyItemBorder: {
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    },
    historyDot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
      backgroundColor: colors.primary,
      marginTop: 5,
    },
    historyContent: {
      flex: 1,
    },
    historyStatus: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },
    historyNote: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
    },

    // ── PAINEL DE AÇÕES REDESENHADO (SEM A PILHA DE 9 BOTÕES) ────
    actionsSection: {
      marginTop: 10,
      gap: 10,
      marginBottom: spacing['2xl'],
    },

    // 1. Ações Comerciais Primárias (Aprovar / WhatsApp)
    primaryActionsGroup: {
      gap: 8,
    },
    approveButton: {
      height: 48,
      borderRadius: radius.lg,
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      // Shadow cross-platform
      ...({
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 3,
      } as any),
    },
    approveButtonText: {
      color: colors.white,
      fontSize: 15,
      fontWeight: '700',
    },
    whatsAppButton: {
      height: 46,
      borderRadius: radius.lg,
      backgroundColor: colors.whatsapp,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      // Shadow cross-platform
      ...({
        shadowColor: colors.whatsapp,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
      } as any),
    },
    whatsAppButtonText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: '700',
    },
    followUpWhatsAppBtn: {
      height: 42,
      borderRadius: radius.lg,
      backgroundColor: isDark ? 'rgba(37, 211, 102, 0.15)' : colors.followUpBg,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(37, 211, 102, 0.3)' : colors.followUpBorder,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
    },
    followUpWhatsAppText: {
      color: isDark ? colors.followUpText : colors.followUpText,
      fontSize: 13,
      fontWeight: '700',
    },

    // 2. Grade de Ações Rápidas (2x2)
    quickActionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    quickActionCard: {
      flex: 1,
      minWidth: '47%',
      height: 46,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      paddingHorizontal: 10,
    },
    quickActionCardPressed: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.divider,
    },
    quickActionText: {
      fontSize: 12.5,
      fontWeight: '600',
      color: colors.text,
    },

    // 3. Ações Secundárias / Gestão no Rodapé
    secondaryActionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 2,
    },
    secondaryOutlineBtn: {
      flex: 1,
      height: 38,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
    },
    secondaryOutlineText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    deleteButton: {
      height: 38,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(239, 68, 68, 0.25)' : colors.dangerBorder,
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.08)' : colors.dangerSoft,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginTop: 4,
    },
    deleteButtonText: {
      fontSize: 12.5,
      fontWeight: '600',
      color: colors.danger,
    },

    // ── Modais ────────────────────────────────────────────────────
    modalBackdrop: {
      flex: 1,
      backgroundColor: colors.overlay,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    modalCard: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      padding: spacing.xl,
      borderColor: colors.border,
      borderWidth: 1,
      ...shadows.medium,
    },
    modalTitle: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.bold,
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    modalMessage: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.md,
      lineHeight: 18,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: spacing.sm,
    },
    modalButton: {
      flex: 1,
    },
    rejectInput: {
      marginBottom: spacing.md,
    },

    // Mantido para compatibilidade retroativa
    actionButton: {
      marginBottom: spacing.xs,
    },
    pdfButton: {},
    pdfButtonPressed: {},
    pdfButtonDisabled: {},
  });
