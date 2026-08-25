import React from 'react';
import { render, screen } from '@testing-library/react-native';
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
 * Migração RNTL v14:
 * - `render` é assíncrono (React 19 + React.act) → `await render(...)`.
 * - Cleanup automático entre testes (sem unmount manual).
 * - Textos via `screen.getByText` (em vez de react-test-renderer.root).
 * - Cores via `toJSON()` do TestInstance escopado por testID.
 */
describe('FinancialSummaryCard', () => {
  it('renderiza snapshot estável com dados completos', async () => {
    const { toJSON } = await render(
      <FinancialSummaryCard financialSummary={mockSummary} />
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('exibe todos os rótulos esperados', async () => {
    await render(<FinancialSummaryCard financialSummary={mockSummary} />);

    expect(screen.getByText('Resumo Financeiro')).toBeTruthy();
    expect(screen.getByText('Receita')).toBeTruthy();
    expect(screen.getByText('Custo')).toBeTruthy();
    expect(screen.getByText('Resultado')).toBeTruthy();
    expect(screen.getByText('Valor contratado')).toBeTruthy();
    expect(screen.getByText('Aditivos aprovados')).toBeTruthy();
    expect(screen.getByText('Total contratado')).toBeTruthy();
    expect(screen.getByText('Recebido')).toBeTruthy();
    expect(screen.getByText('A receber')).toBeTruthy();
    expect(screen.getByText('Custo realizado')).toBeTruthy();
    expect(screen.getByText('Resultado projetado')).toBeTruthy();
    expect(screen.getByText('Resultado realizado')).toBeTruthy();
    expect(screen.getByText('Margem')).toBeTruthy();
  });

  it('exibe valores formatados em moeda (BRL)', async () => {
    await render(<FinancialSummaryCard financialSummary={mockSummary} />);

    expect(screen.getByText('R$ 10.000,00')).toBeTruthy();
    expect(screen.getByText('R$ 500,00')).toBeTruthy();
    expect(screen.getByText('R$ 10.500,00')).toBeTruthy();
    expect(screen.getByText('R$ 6.000,00')).toBeTruthy();
    expect(screen.getByText('R$ 4.500,00')).toBeTruthy();
    expect(screen.getByText('R$ 5.500,00')).toBeTruthy();
    expect(screen.getByText('R$ 3.500,00')).toBeTruthy();
    expect(screen.getByText('R$ 5.000,00')).toBeTruthy();
  });

  it('exibe margem como percentual formatado', async () => {
    await render(<FinancialSummaryCard financialSummary={mockSummary} />);

    expect(screen.getByText('47,6%')).toBeTruthy();
  });

  it('renderiza sem quebrar com valores zero', async () => {
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

    const { toJSON } = await render(
      <FinancialSummaryCard financialSummary={zeroSummary} />
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('renderiza sem quebrar com valores negativos', async () => {
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

    const { toJSON } = await render(
      <FinancialSummaryCard financialSummary={negativeSummary} />
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('aplica cor verde (success) ao valor Recebido positivo', async () => {
    await render(<FinancialSummaryCard financialSummary={mockSummary} />);

    const json = JSON.stringify(screen.getByTestId('row-received').toJSON());
    // received = 6000 > 0 → success (#10B981)
    expect(json).toContain('#10B981');
  });

  it('aplica cor vermelha (danger) ao valor A receber', async () => {
    await render(<FinancialSummaryCard financialSummary={mockSummary} />);

    const json = JSON.stringify(screen.getByTestId('row-to-receive').toJSON());
    // toReceive é sempre tratado como dívida → danger (#EF4444)
    expect(json).toContain('#EF4444');
  });

  it('aplica cor vermelha (danger) ao Custo realizado', async () => {
    await render(<FinancialSummaryCard financialSummary={mockSummary} />);

    const json = JSON.stringify(screen.getByTestId('row-realized-cost').toJSON());
    // realizedCost é sempre tratado como saída → danger (#EF4444)
    expect(json).toContain('#EF4444');
  });

  it('aplica cor verde (success) ao Resultado realizado positivo', async () => {
    await render(<FinancialSummaryCard financialSummary={mockSummary} />);

    const json = JSON.stringify(screen.getByTestId('row-cash-result').toJSON());
    // cashResult = 5000 > 0 → success (#10B981)
    expect(json).toContain('#10B981');
  });

  it('passa testID para o card raiz', async () => {
    await render(
      <FinancialSummaryCard
        financialSummary={mockSummary}
        testID="financial-summary-card"
      />
    );

    expect(screen.getByTestId('financial-summary-card')).toBeTruthy();
  });
});
