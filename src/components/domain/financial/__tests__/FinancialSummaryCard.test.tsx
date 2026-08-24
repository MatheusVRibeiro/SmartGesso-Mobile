import React from 'react';
import TestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import { FinancialSummaryCard } from '../FinancialSummaryCard';
import type { FinancialSummary } from '../../../../types/financialSummary';

const mockSummary: FinancialSummary = {
  contractedValue: 10000,
  additionalApproved: 500,
  totalContracted: 10500,
  received: 6000,
  toReceive: 4500,
  forecastCost: 7000,
  realizedCost: 5500,
  projectedResult: 3500,
  cashResult: 5000,
  margin: 47.6,
};

/**
 * Extrai todo o texto visível da árvore de renderização usando react-test-renderer.
 */
function extractAllText(testRenderer: TestRenderer.ReactTestRenderer): string {
  const textElements = testRenderer.root.findAllByType(Text);
  return textElements
    .map((el) => {
      const children = el.props.children;
      if (typeof children === 'string') return children;
      if (Array.isArray(children)) return children.join('');
      return '';
    })
    .filter(Boolean)
    .join('\n');
}

describe('FinancialSummaryCard', () => {
  it('renderiza snapshot estável com dados completos', () => {
    const testRenderer = TestRenderer.create(
      <FinancialSummaryCard financialSummary={mockSummary} />
    );

    expect(testRenderer.toJSON()).toMatchSnapshot();
  });

  it('exibe todos os rótulos esperados', () => {
    const testRenderer = TestRenderer.create(
      <FinancialSummaryCard financialSummary={mockSummary} />
    );

    const text = extractAllText(testRenderer);

    expect(text).toContain('Resumo Financeiro');
    expect(text).toContain('Receita');
    expect(text).toContain('Custo');
    expect(text).toContain('Resultado');
    expect(text).toContain('Valor contratado');
    expect(text).toContain('Aditivos aprovados');
    expect(text).toContain('Total contratado');
    expect(text).toContain('Recebido');
    expect(text).toContain('A receber');
    expect(text).toContain('Custo realizado');
    expect(text).toContain('Resultado projetado');
    expect(text).toContain('Resultado realizado');
    expect(text).toContain('Margem');
  });

  it('exibe valores formatados em moeda (BRL)', () => {
    const testRenderer = TestRenderer.create(
      <FinancialSummaryCard financialSummary={mockSummary} />
    );

    const text = extractAllText(testRenderer);

    expect(text).toContain('R$ 10.000,00');
    expect(text).toContain('R$ 500,00');
    expect(text).toContain('R$ 10.500,00');
    expect(text).toContain('R$ 6.000,00');
    expect(text).toContain('R$ 4.500,00');
    expect(text).toContain('R$ 5.500,00');
    expect(text).toContain('R$ 3.500,00');
    expect(text).toContain('R$ 5.000,00');
  });

  it('exibe margem como percentual formatado', () => {
    const testRenderer = TestRenderer.create(
      <FinancialSummaryCard financialSummary={mockSummary} />
    );

    const text = extractAllText(testRenderer);

    expect(text).toContain('47,6%');
  });

  it('renderiza sem quebrar com valores zero', () => {
    const zeroSummary: FinancialSummary = {
      contractedValue: 0,
      additionalApproved: 0,
      totalContracted: 0,
      received: 0,
      toReceive: 0,
      forecastCost: 0,
      realizedCost: 0,
      projectedResult: 0,
      cashResult: 0,
      margin: 0,
    };

    const testRenderer = TestRenderer.create(
      <FinancialSummaryCard financialSummary={zeroSummary} />
    );

    expect(testRenderer.toJSON()).toMatchSnapshot();
  });

  it('renderiza sem quebrar com valores negativos', () => {
    const negativeSummary: FinancialSummary = {
      contractedValue: 5000,
      additionalApproved: 0,
      totalContracted: 5000,
      received: 2000,
      toReceive: 3000,
      forecastCost: 6000,
      realizedCost: 6500,
      projectedResult: -1000,
      cashResult: -1500,
      margin: -30,
    };

    const testRenderer = TestRenderer.create(
      <FinancialSummaryCard financialSummary={negativeSummary} />
    );

    expect(testRenderer.toJSON()).toMatchSnapshot();
  });

  it('aplica cor verde (success) ao valor Recebido positivo', () => {
    const testRenderer = TestRenderer.create(
      <FinancialSummaryCard financialSummary={mockSummary} />
    );

    const json = JSON.stringify(testRenderer.toJSON());
    // received = 6000 > 0 → success (#059669)
    expect(json).toContain('#059669');
  });

  it('aplica cor vermelha (danger) ao valor A receber', () => {
    const testRenderer = TestRenderer.create(
      <FinancialSummaryCard financialSummary={mockSummary} />
    );

    const json = JSON.stringify(testRenderer.toJSON());
    // toReceive é sempre tratado como dívida → danger (#DC2626)
    expect(json).toContain('#DC2626');
  });

  it('aplica cor vermelha (danger) ao Custo realizado', () => {
    const testRenderer = TestRenderer.create(
      <FinancialSummaryCard financialSummary={mockSummary} />
    );

    const json = JSON.stringify(testRenderer.toJSON());
    // realizedCost é sempre tratado como saída → danger (#DC2626)
    expect(json).toContain('#DC2626');
  });

  it('aplica cor verde (success) ao Resultado realizado positivo', () => {
    const testRenderer = TestRenderer.create(
      <FinancialSummaryCard financialSummary={mockSummary} />
    );

    const json = JSON.stringify(testRenderer.toJSON());
    // cashResult = 5000 > 0 → success (#059669)
    expect(json).toContain('#059669');
  });

  it('passa testID para o card raiz', () => {
    const testRenderer = TestRenderer.create(
      <FinancialSummaryCard
        financialSummary={mockSummary}
        testID="financial-summary-card"
      />
    );

    expect(testRenderer.toJSON()).toHaveProperty(
      'props.testID',
      'financial-summary-card'
    );
  });
});
