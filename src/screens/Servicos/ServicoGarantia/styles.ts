import { StyleSheet } from 'react-native';
import type { ActivePalette } from '@/src/theme/ThemeProvider';
import { typography, spacing, borders, sizes } from '@/src/theme';

export const createServicoGarantiaStyles = (colors: ActivePalette, isDark: boolean) => StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    marginTop: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.weights.bold,
    color: colors.text,
  },
  addButton: {
    paddingHorizontal: spacing.sm,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyText: {
    color: colors.textLight,
  },
  card: {
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontSize: typography.sizes.md,
    fontFamily: typography.weights.bold,
    color: colors.text,
  },
  cardBody: {
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
  },
  value: {
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  modalSafe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: borders.width.thin,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.weights.bold,
    color: colors.text,
  },
  modalBody: {
    padding: spacing.md,
    gap: spacing.md,
  },
  modalButton: {
    marginTop: spacing.md,
  },
});
