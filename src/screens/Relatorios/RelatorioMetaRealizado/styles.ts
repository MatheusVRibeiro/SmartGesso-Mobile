import { StyleSheet } from 'react-native';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { typography, spacing, radius, sizes } from '@/src/theme';

export const createRelatorioMetaRealizadoStyles = (colors: ActivePalette, isDark: boolean) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    fontFamily: typography.weights.regular,
    color: colors.textSecondary,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.md,
  },
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  metricTitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.weights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  metricValue: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  metricSubtitle: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.weights.regular,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.weights.regular,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  sectionCard: {
    padding: spacing.md,
  },
  listItem: {
    paddingVertical: spacing.md,
  },
  listItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listItemContent: {
    marginBottom: spacing.sm,
  },
  listItemTitle: {
    fontSize: typography.sizes.md,
    fontFamily: typography.weights.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  categoryDetails: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  categoryDetail: {
    flexDirection: 'row',
  },
  categoryDetailLabel: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.weights.regular,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  categoryDetailValue: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.weights.medium,
    color: colors.text,
  },
  categoryPercentual: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  categoryPercentualValue: {
    fontSize: typography.sizes.md,
    fontFamily: typography.weights.bold,
    minWidth: 60,
    textAlign: 'right',
  },
  positiveBalance: {
    color: colors.success,
  },
  neutralBalance: {
    color: colors.warning,
  },
  negativeBalance: {
    color: colors.danger,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressBarText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.weights.medium,
    color: colors.textSecondary,
    minWidth: 50,
    textAlign: 'right',
  },
  filtersSection: {
    marginBottom: spacing.xl,
  },
  filterLabel: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.weights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  filterScroll: {
    marginBottom: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.weights.medium,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.primary,
  },
  emptyText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.weights.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryRowTotal: {
    borderBottomWidth: 0,
    paddingTop: spacing.md,
  },
  summaryLabel: {
    fontSize: typography.sizes.md,
    fontFamily: typography.weights.medium,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: typography.sizes.md,
    fontFamily: typography.weights.bold,
    color: colors.text,
  },
});
