import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AppCard } from '../ui/AppCard';
import { colors, spacing, typography } from '../../theme';
import { formatCurrency, formatNumber } from '../../utils/format';

export interface MaterialResultCardProps {
  /** Nome do material (ex.: "Placa de gesso 1,20x1,80"). */
  name: string;
  /** Quantidade calculada (ex.: 12.5). */
  quantity: number;
  /** Unidade de medida (ex.: "m²", "un"). */
  unit: string;
  /** Preço unitário do material (BRL). */
  unitPrice?: number | null;
  /** Total do item (quantidade × preço unitário). */
  total?: number | null;
  style?: ViewStyle;
  testID?: string;
}

/**
 * Card de resultado de material calculado pela composição (Fase 3).
 * Exibe nome, quantidade + unidade, preço unitário e total em BRL.
 */
function MaterialResultCard({
  name,
  quantity,
  unit,
  unitPrice,
  total,
  style,
  testID,
}: MaterialResultCardProps) {
  const totalValue = total ?? unitPrice;

  const accessibilityLabel = [
    name,
    `Quantidade: ${formatNumber(quantity)} ${unit}`,
    unitPrice != null ? `Preço unitário: ${formatCurrency(unitPrice)}` : null,
    totalValue != null ? `Total: ${formatCurrency(totalValue)}` : null,
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <AppCard shadow="light" style={StyleSheet.flatten([styles.card, style])} testID={testID}>
      <View accessible accessibilityLabel={accessibilityLabel}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={2}>
            {name}
          </Text>
          <Text style={styles.total}>{formatCurrency(totalValue)}</Text>
        </View>

        <View style={styles.meta}>
          <Text style={styles.quantity}>
            {formatNumber(quantity)} {unit}
          </Text>
          {unitPrice != null ? (
            <Text style={styles.unitPrice}>
              {formatCurrency(unitPrice)}/{unit}
            </Text>
          ) : null}
        </View>
      </View>
    </AppCard>
  );
}

export default MaterialResultCard;
export { MaterialResultCard };

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  name: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  total: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  meta: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.md,
  },
  quantity: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  unitPrice: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
  },
});
