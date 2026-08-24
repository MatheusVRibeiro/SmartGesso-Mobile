/**
 * SmartGesso Mobile — Etapa 5: Valores do wizard de orçamento.
 *
 * Extraído de app/(app)/orcamentos/novo.tsx (ETAPA 4).
 * O estado (draft) permanece no screen; este componente é apresentacional.
 */
import React from 'react';
import { Text, View } from 'react-native';
import { AppCard } from '../../../ui/AppCard';
import { AppInput } from '../../../ui/AppInput';
import { formatCurrency } from '../../../../utils/format';
import { styles } from '../wizard/styles';
import { PermissionGate } from '../../PermissionGate';
import { COST_VIEW_ROLES } from '../../../../types/permissions';

export interface ValoresStepProps {
  materialsTotal: number;
  servicesTotal: number;
  itemsTotal: number;
  quoteTotal: number;
  discount: string;
  marginPct: string;
  onDiscountChange: (value: string) => void;
  onMarginPctChange: (value: string) => void;
}

export function ValoresStep({
  materialsTotal,
  servicesTotal,
  itemsTotal,
  quoteTotal,
  discount,
  marginPct,
  onDiscountChange,
  onMarginPctChange,
}: ValoresStepProps) {
  return (
    <View>
      <AppCard shadow="light" style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Resumo dos valores</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Materiais</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(materialsTotal)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Serviços</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(servicesTotal)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(itemsTotal)}
          </Text>
        </View>

        <View style={styles.summaryFieldsRow}>
          <View style={styles.itemFieldHalf}>
            <AppInput
              label="Desconto (R$)"
              value={discount}
              onChangeText={onDiscountChange}
              placeholder="0,00"
              keyboardType="decimal-pad"
              accessibilityLabel="Desconto"
              style={styles.summaryInput}
            />
          </View>
          <PermissionGate allow={COST_VIEW_ROLES}>
            <View style={styles.itemFieldHalf}>
              <AppInput
                label="Margem (%)"
                value={marginPct}
                onChangeText={onMarginPctChange}
                placeholder="0"
                keyboardType="decimal-pad"
                accessibilityLabel="Margem percentual"
                style={styles.summaryInput}
              />
            </View>
          </PermissionGate>
        </View>

        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalValue}>{formatCurrency(quoteTotal)}</Text>
        </View>
      </AppCard>
    </View>
  );
}

export default ValoresStep;
