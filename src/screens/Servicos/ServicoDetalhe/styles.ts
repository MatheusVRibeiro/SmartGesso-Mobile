import { StyleSheet } from 'react-native';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { typography, spacing, borders, radius, sizes } from '@/src/theme';

export const createServicoDetalheStyles = (colors: ActivePalette, isDark: boolean) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingBottom: 48,
      maxWidth: 680,
      width: '100%',
      alignSelf: 'center',
    },

    // ── Cabeçalho Único Limpo ──
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: sizes.screenPadding,
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flex: 1,
    },
    headerBackBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
    },
    headerTitleWrap: {
      flex: 1,
    },
    title: {
      fontSize: 17,
      fontWeight: '800',
      color: colors.text,
      lineHeight: 22,
    },
    headerSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    headerDeleteBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
    },

    // ── Cockpit Card (Resumo Superior do Serviço) ──
    cockpitCard: {
      marginHorizontal: sizes.screenPadding,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
      padding: spacing.md,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.sm,
    },
    cockpitTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    codeAndQuoteRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flexWrap: 'wrap',
    },
    osCodeBadge: {
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: radius.sm,
    },
    osCodeText: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.primary,
    },
    quoteTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: radius.sm,
    },
    quoteTagText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    orderHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
    },
    orderNumber: {
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.bold,
      color: colors.text,
    },

    // Cliente e Obra
    clientRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: 2,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#1E293B' : '#EFF6FF',
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#DBEAFE',
    },
    avatarText: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.primary,
    },
    clientDetails: {
      flex: 1,
    },
    clientName: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      lineHeight: 19,
    },
    workSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '500',
      marginTop: 1,
    },

    // Ações Rápidas Imediatas (WhatsApp, Ligar, GPS)
    quickContactsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 4,
    },
    contactBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: radius.md,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F8FAFC',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
    },
    contactBtnWhatsApp: {
      backgroundColor: isDark ? 'rgba(37, 211, 102, 0.12)' : '#DCFCE7',
      borderColor: isDark ? 'rgba(37, 211, 102, 0.25)' : '#BBF7D0',
    },
    contactBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.text,
    },
    contactBtnTextWhatsApp: {
      color: isDark ? '#4ADE80' : '#15803D',
    },

    // Datas / Prazo compacto
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: spacing.xs,
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
      flexWrap: 'wrap',
      gap: 6,
    },
    dateItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    dateLabel: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    dateValue: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.text,
    },
    lateBadge: {
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2',
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: radius.sm,
    },
    lateBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.danger,
    },

    // ── Abas Segmentadas ──
    tabsContainer: {
      flexDirection: 'row',
      marginHorizontal: sizes.screenPadding,
      marginVertical: spacing.sm,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9',
      borderRadius: radius.md,
      padding: 3,
      gap: 3,
    },
    tabItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      paddingVertical: 8,
      borderRadius: radius.sm,
    },
    tabItemActive: {
      backgroundColor: colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    tabText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    tabTextActive: {
      fontWeight: '800',
      color: colors.text,
    },
    tabBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: 8,
    },
    tabBadgeText: {
      fontSize: 9,
      fontWeight: '800',
      color: '#FFFFFF',
    },

    // Painéis de Abas
    tabContent: {
      paddingHorizontal: sizes.screenPadding,
      gap: spacing.sm,
    },
    hiddenTab: {
      display: 'none',
    },

    // ── Card de Ação de Status Principal (Contextual) ──
    statusActionCard: {
      padding: spacing.md,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.sm,
    },
    statusActionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    statusActionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    currentStatusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: radius.full,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    statusButtonsRow: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
    },
    primaryActionBtn: {
      flex: 1,
    },

    // ── Resumo Financeiro Slim ──
    financeiroCard: {
      padding: spacing.md,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.sm,
    },
    financeiroTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    financeiroCardTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    financeiroRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 8,
    },
    financeiroItem: {
      flex: 1,
    },
    financeiroLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    financeiroValue: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
    },
    financeiroValueSemibold: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
    },
    financeiroActionsRow: {
      flexDirection: 'row',
      gap: 8,
      paddingTop: spacing.xs,
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
    },
    financeiroActionBtn: {
      flex: 1,
    },
    financeiroHint: {
      fontSize: 11,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },

    // ── Materiais Usados ──
    materialsCard: {
      padding: spacing.md,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
    },
    materialsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    materialsTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    materialRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
      gap: 8,
    },
    materialLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
    },
    materialName: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    materialQuantity: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
    },

    // ── Accordions de Checklist e Pré-Requisitos ──
    accordionCard: {
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    accordionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.md,
      backgroundColor: colors.surface,
    },
    accordionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
    },
    accordionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    accordionBadge: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 10,
    },
    accordionBadgeSuccess: {
      backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7',
    },
    accordionBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    accordionBadgeTextSuccess: {
      color: colors.success,
    },
    accordionBody: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.md,
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
      gap: 6,
      paddingTop: 8,
    },
    checklistItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 7,
      paddingHorizontal: 8,
      borderRadius: radius.sm,
    },
    checklistItemPressed: {
      backgroundColor: colors.primarySoft,
    },
    checklistItemLabel: {
      flex: 1,
      fontSize: 13,
      color: colors.text,
      fontWeight: '500',
    },
    checklistItemLabelChecked: {
      color: colors.textSecondary,
      textDecorationLine: 'line-through',
    },
    checklistHint: {
      fontSize: 11,
      color: colors.textSecondary,
      fontStyle: 'italic',
      marginTop: 4,
    },

    // ── Etapas do Serviço (Timeline) ──
    etapasCard: {
      padding: spacing.md,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
    },
    etapaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: 8,
      paddingHorizontal: 8,
      borderRadius: radius.sm,
    },
    etapaRowPressed: {
      backgroundColor: colors.primarySoft,
    },
    etapaLabel: {
      flex: 1,
      fontSize: 13,
      color: colors.text,
      fontWeight: '500',
    },
    etapaLabelDone: {
      color: colors.textSecondary,
      textDecorationLine: 'line-through',
    },
    etapaLabelCurrent: {
      fontWeight: '800',
      color: colors.primary,
    },
    etapaBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: radius.full,
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF',
    },
    etapaBadgeDone: {
      backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7',
    },
    etapaBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.primary,
    },
    etapaBadgeTextDone: {
      color: colors.success,
    },
    etapaHint: {
      fontSize: 11,
      color: colors.textSecondary,
      fontStyle: 'italic',
      marginTop: 4,
    },

    // ── Produção (Feature Gate & Testes) ──
    producaoCard: {
      padding: spacing.md,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.sm,
    },
    producaoQuestion: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
    },
    producaoToggleRow: {
      flexDirection: 'row',
      gap: 8,
    },
    producaoToggleButton: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9',
      borderWidth: 1,
      borderColor: colors.border,
    },
    producaoToggleButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    producaoToggleButtonText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    producaoToggleButtonTextActive: {
      color: '#FFFFFF',
    },

    // ── Fotos da Obra ──
    photosCard: {
      padding: spacing.md,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.sm,
    },
    photoSection: {
      gap: 12,
    },
    photoHint: {
      fontSize: 11,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },

    // ── Custos, Despesas e Fechamento ──
    custosCard: {
      padding: spacing.md,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.sm,
    },
    custosRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    custosLabel: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    custosValue: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.warning,
    },
    resultCard: {
      padding: spacing.md,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.sm,
    },
    resultRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    resultInfo: {
      flex: 1,
    },
    resultLabel: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    resultValue: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    resultValueSemibold: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    resultProfitRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    profitValue: {
      fontSize: 16,
      fontWeight: '800',
    },
    marginText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    resultCtaButton: {
      marginTop: 4,
    },
    divider: {
      height: 1,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
      marginVertical: 4,
    },

    // Observações
    obsCard: {
      padding: spacing.md,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    obsText: {
      fontSize: 13,
      color: colors.text,
      lineHeight: 18,
    },

    // Modais
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: sizes.screenPadding,
    },
    modalCard: {
      width: '100%',
      maxWidth: 480,
      padding: spacing.lg,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      gap: spacing.md,
    },
    modalTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: colors.text,
    },
    modalActions: {
      flexDirection: 'row',
      gap: spacing.sm,
      justifyContent: 'flex-end',
      marginTop: spacing.sm,
    },
    modalButton: {
      minWidth: 100,
    },
    pauseReasonItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: 10,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.md,
    },
    pauseReasonItemSelected: {
      backgroundColor: colors.primarySoft,
    },
    pauseReasonLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },

    // Compatibilidade de estilos herdados
    orderCard: {
      padding: spacing.md,
      marginBottom: spacing.md,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textSecondary,
      marginBottom: 4,
    },
    prazoCard: {
      padding: spacing.md,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.sm,
    },
    prazoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    prazoItem: {
      flex: 1,
    },
    prazoLabel: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    prazoValue: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
    },
    prazoBadgeWrap: {
      marginTop: 8,
      alignSelf: 'flex-start',
    },
    prazoLateButton: {
      marginTop: 8,
    },
    prereqCard: {
      padding: spacing.md,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    checklistCard: {
      padding: spacing.md,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    materialCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.sm,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 6,
      gap: spacing.sm,
    },
    materialIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
    },
    materialInfo: {
      flex: 1,
    },
    emptyText: {
      fontSize: 13,
      color: colors.textSecondary,
      fontStyle: 'italic',
      paddingVertical: 8,
    },
    statusCard: {
      padding: spacing.md,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statusActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    statusActionButton: {
      flex: 1,
      minWidth: 120,
    },
  });
