import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AppCard } from '../../ui/AppCard';
import { colors, radius, spacing, typography } from '../../../theme';
import { formatCurrency, formatNumber } from '../../../utils/format';
import type { FinancialSummary } from '../../../types/financialSummary';

export interface FinancialSummaryCardProps {
  /** Resumo financeiro vindo da API (fonte da verdade). */
  financialSummary: FinancialSummary;
  style?: ViewStyle;
  testID?: string;
}

/**
 * Determina a cor semântica de um valor monetário.
 * - Verde (success) para valores positivos / receitas.
 * - Vermelho (danger) para valores negativos / custos / dívidas.
 * - Texto neutro para zeros.
 */
function amountColor(value: number): string {
  if (value > 0) return colors.success;
  if (value < 0) return colors.danger;
  return colors.textSecondary;
}

/**
 * Linha de rótulo + valor, com alinhamento consistente.
 */
function FinancialRow({
  label,
  value,
  valueColor = colors.text,
  testID,
}: {
  label: string;
  value: string;
  valueColor?: string;
  testID?: string;
}) {
  return (
    <View style={styles.row} testID={testID}>
      <Text style={styles.rowLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text
        style={[styles.rowValue, { color: valueColor }]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

/**
 * Cabeçalho de seção (ex.: "Receita", "Custo", "Resultado").
 */
function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

/**
 * Card reutilizável de resumo financeiro de uma ordem de serviço.
 *
 * Exibe separadamente: Valor contratado, Aditivos aprovados, Total contratado,
 * Recebido, A receber, Custo realizado, Resultado projetado, Resultado realizado
 * e Margem.
 *
 * Todos os valores vêm da API via prop `financialSummary` — o frontend NÃO
 * recalcula a fonte da verdade.
 */
function FinancialSummaryCard({
  financialSummary,
  style,
  testID,
}: FinancialSummaryCardProps) {
  const {
    contractedValue,
    additionalApproved,
    totalContracted,
    received,
    toReceive,
    realizedCost,
    projectedResult,
    cashResult,
    margin,
  } = financialSummary;

  return (
    <AppCard
      shadow="light"
      radius={radius.md}
      style={StyleSheet.flatten([styles.card, style])}
      testID={testID}
    >
      <Text style={styles.title} accessibilityRole="header">
        Resumo Financeiro
      </Text>

      <SectionHeader title="Receita" />
      <FinancialRow
        label="Valor contratado"
        value={formatCurrency(contractedValue)}
        testID="row-contracted-value"
      />
      <FinancialRow
        label="Aditivos aprovados"
        value={formatCurrency(additionalApproved)}
        testID="row-additional-approved"
      />
      <FinancialRow
        label="Total contratado"
        value={formatCurrency(totalContracted)}
        valueColor={colors.primary}
        testID="row-total-contracted"
      />
      <FinancialRow
        label="Recebido"
        value={formatCurrency(received)}
        valueColor={amountColor(received)}
        testID="row-received"
      />
      <FinancialRow
        label="A receber"
        value={formatCurrency(toReceive)}
        valueColor={colors.danger}
        testID="row-to-receive"
      />

      <SectionHeader title="Custo" />
      <FinancialRow
        label="Custo realizado"
        value={formatCurrency(realizedCost)}
        valueColor={colors.danger}
        testID="row-realized-cost"
      />

      <SectionHeader title="Resultado" />
      <FinancialRow
        label="Resultado projetado"
        value={formatCurrency(projectedResult)}
        valueColor={amountColor(projectedResult)}
        testID="row-projected-result"
      />
      <FinancialRow
        label="Resultado realizado"
        value={formatCurrency(cashResult)}
        valueColor={amountColor(cashResult)}
        testID="row-cash-result"
      />
      <FinancialRow
        label="Margem"
        value={`${formatNumber(margin)}%`}
        valueColor={amountColor(margin)}
        testID="row-margin"
      />
    </AppCard>
  );
}

export default FinancialSummaryCard;
export { FinancialSummaryCard };

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  rowLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  rowValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    textAlign: 'right',
    flex: 0,
  },
});
