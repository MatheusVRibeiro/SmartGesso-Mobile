import { StyleSheet } from 'react-native';
import { typography, spacing, radius, sizes } from '@/src/theme';
import type { ActivePalette } from '@/src/theme/ThemeProvider';

export const createOrcamentosStyles = (colors: ActivePalette, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerWrapper: {
      paddingHorizontal: sizes.screenPadding,
      paddingTop: spacing.sm,
      paddingBottom: 4,
      backgroundColor: colors.background,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: 10,
    },
    titleSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
    },
    titleIconBadge: {
      width: 38,
      height: 38,
      borderRadius: 11,
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(59, 130, 246, 0.28)' : '#DBEAFE',
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
    },
    title: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.4,
    },
    countBadge: {
      paddingHorizontal: 7,
      paddingVertical: 1.5,
      borderRadius: radius.full,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#E2E8F0',
    },
    countBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    subtitle: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 1,
    },
    headerDivider: {
      height: 1,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#E2E8F0',
      marginBottom: 10,
    },
    addButton: {
      height: 36,
      borderRadius: radius.full,
      paddingHorizontal: 14,
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      // Shadow cross-platform
      ...({
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 3,
      } as any),
    },
    addButtonText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '600',
    },

    // ── Mini-Dashboard KPIs Slim ──────────────────────────────────
    kpiSection: {
      marginBottom: 8,
    },
    kpiScroll: {
      flexDirection: 'row',
      gap: 8,
      paddingRight: spacing.md,
    },
    kpiCard: {
      height: 52,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      minWidth: 142,
    },
    kpiCardActive: {
      borderColor: colors.primary,
      backgroundColor: isDark ? 'rgba(30, 64, 175, 0.2)' : '#EFF6FF',
    },
    kpiIconWrap: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
    },
    kpiContent: {
      justifyContent: 'center',
    },
    kpiLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    kpiLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    kpiBadge: {
      fontSize: 9,
      fontWeight: '800',
      paddingHorizontal: 4,
      paddingVertical: 1,
      borderRadius: radius.full,
    },
    kpiValue: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.text,
      marginTop: 1,
    },

    // ── Busca e Ordenação Compacta ────────────────────────────────
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 6,
    },
    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      height: 38,
      gap: 6,
    },
    searchInput: {
      flex: 1,
      fontSize: 13,
      color: colors.text,
      height: '100%',
    },
    sortButton: {
      height: 38,
      paddingHorizontal: 10,
      borderRadius: radius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    sortButtonActive: {
      borderColor: colors.primary,
      backgroundColor: isDark ? 'rgba(30, 64, 175, 0.12)' : '#EFF6FF',
    },
    sortButtonText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
    },

    // ── Chips de Filtro Compactos ─────────────────────────────────
    filterScroll: {
      flexDirection: 'row',
      gap: 6,
      paddingBottom: 6,
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 11,
      paddingVertical: 5,
      borderRadius: radius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterChipText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    filterChipTextActive: {
      color: '#FFFFFF',
    },
    filterChipBadge: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)',
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: radius.full,
    },
    filterChipBadgeActive: {
      backgroundColor: 'rgba(255,255,255,0.25)',
    },
    filterChipBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    filterChipBadgeTextActive: {
      color: '#FFFFFF',
    },

    // ── Lista e Cards de Alta Densidade ───────────────────────────
    listContent: {
      paddingHorizontal: sizes.screenPadding,
      paddingTop: 4,
      paddingBottom: spacing['4xl'],
      maxWidth: 680,
      width: '100%',
      alignSelf: 'center',
    },
    card: {
      marginBottom: 8,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardInner: {
      padding: 12,
      gap: 8,
    },
    cardTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    cardClientGroup: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#1E293B' : '#EFF6FF',
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#DBEAFE',
    },
    avatarText: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.primary,
    },
    clientInfo: {
      flex: 1,
    },
    clientName: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.2,
    },
    codeAndMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: 2,
    },
    codeText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
    },
    metaDot: {
      color: colors.textLight,
      fontSize: 10,
    },
    metaText: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    workText: {
      fontSize: 11,
      color: colors.textSecondary,
      maxWidth: 130,
    },

    // Status Pill
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: radius.full,
    },
    statusDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
    },
    statusPillText: {
      fontSize: 10,
      fontWeight: '700',
    },

    // Linha Inferior: Valor + Ações Compactas
    cardBottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 4,
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    },
    valueGroup: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 6,
    },
    cardTotal: {
      fontSize: 17,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.4,
    },
    paymentChip: {
      paddingHorizontal: 6,
      paddingVertical: 1,
      borderRadius: radius.sm,
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    },
    paymentChipText: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.textSecondary,
    },

    // Botões de Ação Rápidos em Ícones
    actionsGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    iconActionBtn: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
    },
    whatsappBtn: {
      backgroundColor: isDark ? 'rgba(37, 211, 102, 0.15)' : 'rgba(37, 211, 102, 0.12)',
    },
    shareBtn: {
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.10)',
    },
    detailsBtn: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

import { colors as defaultColors } from '@/src/theme';
export const styles = createOrcamentosStyles(defaultColors, false);
