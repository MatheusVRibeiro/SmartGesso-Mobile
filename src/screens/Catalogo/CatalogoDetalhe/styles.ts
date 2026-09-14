import { StyleSheet } from 'react-native';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { typography, spacing, radius, sizes } from '@/src/theme';

export const createCatalogoDetalheStyles = (colors: ActivePalette, isDark: boolean) => StyleSheet.create({
  header: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    flex: 1,
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  addButton: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonPressed: {
    opacity: 0.85,
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.warningSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  alertText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.warning,
    fontWeight: typography.weights.medium,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  card: {
    padding: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  infoLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.infoSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  noticeText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.info,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorBannerText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.danger,
  },
  retryText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.danger,
  },
  movementsList: {
    gap: spacing.md,
  },
  movementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  movementIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  movementInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  movementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  movementType: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  movementDate: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
  },
  movementDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  movementOs: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.primary,
  },
  movementQuantity: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
});
