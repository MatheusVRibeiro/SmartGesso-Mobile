import { StyleSheet } from 'react-native';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { typography, spacing, radius, sizes } from '@/src/theme';

export const createCatalogoMateriaisStyles = (colors: ActivePalette, isDark: boolean) => StyleSheet.create({
  list: {
    flex: 1,
    width: '100%',
  },
  listContent: {
    paddingBottom: spacing['4xl'],
    flexGrow: 1,
  },
  headerWrapper: {
    width: '100%',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  headerTitles: {
    flex: 1,
    minWidth: 200,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerSecondaryButton: {
    height: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.inputBackground,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerSecondaryButtonPressed: {
    opacity: 0.75,
  },
  headerSecondaryButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  primaryAddButton: {
    height: 40,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  primaryAddButtonPressed: {
    opacity: 0.85,
  },
  primaryAddButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textOnPrimary,
  },
  // ─── Metrics Dashboard Strip ──────────────────────────────────────────
  metricsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  metricCard: {
    flex: 1,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.surface,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  metricValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  metricSub: {
    fontSize: 11,
    color: colors.textLight,
  },
  // ─── Search & Filters ─────────────────────────────────────────────────
  searchWrapper: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  searchInput: {
    marginBottom: spacing.sm,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.inputBackground,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
    gap: spacing.xs,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.textOnPrimary,
    fontWeight: typography.weights.semibold,
  },
  filterBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.full,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
  },
  filterBadgeTextActive: {
    color: colors.textOnPrimary,
  },
  // ─── Material Cards ───────────────────────────────────────────────────
  cardWrapper: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  card: {
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
    backgroundColor: colors.surface,
  },
  cardMain: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cardIconBox: {
    width: 46,
    height: 46,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardNameAndUnit: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  cardName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  unitPill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.sm,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.inputBackground,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
  },
  unitPillText: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  cardDescription: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  // ─── Financials Strip ─────────────────────────────────────────────────
  financialsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.inputBackground,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 3,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
  },
  priceItem: {
    gap: 1,
  },
  financialLabel: {
    fontSize: 10,
    fontWeight: typography.weights.medium,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  priceValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  costValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  marginBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
  },
  marginText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.success,
  },
  // ─── Stock Row ────────────────────────────────────────────────────────
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs + 2,
    paddingTop: spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
  },
  stockLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stockText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  stockTextAlert: {
    fontWeight: typography.weights.bold,
    color: colors.warning,
  },
  stockTextDanger: {
    fontWeight: typography.weights.bold,
    color: colors.danger,
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  quickMovementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.md,
    backgroundColor: isDark ? 'rgba(34, 197, 94, 0.12)' : 'rgba(34, 197, 94, 0.08)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(34, 197, 94, 0.25)' : 'rgba(34, 197, 94, 0.2)',
  },
  quickMovementButtonText: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: colors.success,
  },
  quickEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.md,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.inputBackground,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
  },
  quickEditButtonText: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
});
