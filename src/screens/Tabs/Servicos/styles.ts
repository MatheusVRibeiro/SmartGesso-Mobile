import { StyleSheet } from 'react-native';
import { typography, spacing, radius, sizes } from '@/src/theme';
import type { ActivePalette } from '@/src/theme/ThemeProvider';

export const createServicosStyles = (colors: ActivePalette, isDark: boolean) =>
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
      paddingBottom: 8,
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
      backgroundColor: isDark ? colors.statusOsInfoBg : colors.primarySoft,
      borderWidth: 1,
      borderColor: colors.statusOsInfoBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.5,
    },
    titleCountBadge: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
    },
    titleCountText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    headerSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 10,
    },
    headerDivider: {
      height: 1,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
      marginBottom: 10,
    },

    // KPIs Slim Strip
    kpiStrip: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 10,
    },
    kpiItem: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    kpiDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },
    kpiContent: {
      flex: 1,
    },
    kpiCount: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
      lineHeight: 18,
    },
    kpiLabel: {
      fontSize: 10,
      color: colors.textSecondary,
      fontWeight: '600',
    },

    // Busca
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.sm,
      height: 38,
      marginBottom: 8,
      gap: 6,
    },
    searchInput: {
      flex: 1,
      fontSize: 13,
      color: colors.text,
      paddingVertical: 0,
      height: '100%',
    },

    // Filtros em Pílulas
    filterScroll: {
      flexDirection: 'row',
      gap: 6,
      paddingBottom: 4,
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
      color: colors.white,
      fontWeight: '700',
    },
    filterBadge: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)',
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: 8,
    },
    filterBadgeActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
    },
    filterBadgeText: {
      fontSize: 9,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    filterBadgeTextActive: {
      color: colors.white,
    },

    // Lista de OS
    listContent: {
      paddingHorizontal: sizes.screenPadding,
      paddingTop: 6,
      paddingBottom: spacing['3xl'],
      maxWidth: 680,
      width: '100%',
      alignSelf: 'center',
    },

    // Card de OS Compacto
    card: {
      marginBottom: 8,
      backgroundColor: colors.surface,
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
      backgroundColor: isDark ? colors.avatarBackground : colors.primarySoft,
      borderWidth: 1,
      borderColor: colors.avatarBorder,
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
      lineHeight: 18,
    },
    codeAndMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 4,
      marginTop: 2,
    },
    codeBadge: {
      backgroundColor: isDark ? colors.statusOsInfoBg : colors.primarySoft,
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: radius.sm,
    },
    codeText: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.primary,
    },
    metaDot: {
      fontSize: 10,
      color: colors.textLight,
    },
    quoteTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: radius.sm,
    },
    quoteTagText: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    workText: {
      fontSize: 11,
      color: colors.textSecondary,
      maxWidth: 130,
    },
    dateText: {
      fontSize: 11,
      color: colors.textLight,
    },

    // Badge de Status
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: radius.full,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    statusPillText: {
      fontSize: 11,
      fontWeight: '700',
    },

    // Linha Inferior
    cardBottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 6,
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
    },
    valueGroup: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 6,
    },
    cardTotal: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.3,
    },
    valueLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.textSecondary,
    },

    // Metadados da Direita e Ações
    actionsGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    materialsChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: radius.sm,
    },
    materialsChipText: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    iconActionBtn: {
      width: 28,
      height: 28,
      borderRadius: 7,
      alignItems: 'center',
      justifyContent: 'center',
    },
    whatsappBtn: {
      backgroundColor: isDark ? colors.statusOsSuccessBg : colors.successBadge,
    },
    detailsBtn: {
      width: 24,
      height: 24,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

import { colors as defaultColors } from '@/src/theme';
export const styles = createServicosStyles(defaultColors, false);
