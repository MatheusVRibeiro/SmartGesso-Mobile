import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { AppCard } from '../ui/AppCard';
import { colors, radius, spacing, typography } from '../../theme';
import { formatCurrency, formatNumber } from '../../utils/format';

type IconName = ComponentProps<typeof Ionicons>['name'];

/** Ícone por unidade de medida — dá variedade visual sem depender de dados. */
function iconForUnit(unit: string): IconName {
  const normalized = unit.trim().toLowerCase();
  if (normalized.includes('m²') || normalized === 'm2') return 'grid-outline';
  if (normalized === 'm') return 'resize-outline';
  if (normalized.includes('kg')) return 'barbell-outline';
  if (normalized.includes('l') || normalized.includes('litro')) return 'water-outline';
  return 'cube-outline';
}

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
 * Exibe ícone, nome, quantidade + unidade em destaque e total em BRL.
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
    <AppCard shadow="light" radius={radius.md} style={StyleSheet.flatten([styles.card, style])} testID={testID}>
      <View accessible accessibilityLabel={accessibilityLabel}>
        <View style={styles.row}>
          <View style={styles.iconCircle}>
            <Ionicons
              name={iconForUnit(unit)}
              size={20}
              color={colors.primary}
              accessibilityElementsHidden
            />
          </View>

          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={2}>
              {name}
            </Text>
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

          <Text style={styles.total}>{formatCurrency(totalValue)}</Text>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.md,
  },
  quantity: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  unitPrice: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
  },
  total: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
});