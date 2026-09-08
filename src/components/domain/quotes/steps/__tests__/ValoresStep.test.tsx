import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ValoresStep } from '../ValoresStep';
import { useSessionStore } from '../../../../../store/useSessionStore';

describe('ValoresStep', () => {
  const defaultProps = {
    materialsTotal: 1500,
    servicesTotal: 500,
    itemsTotal: 2000,
    quoteTotal: 1900,
    discount: '100',
    marginPct: '0',
    onDiscountChange: jest.fn(),
    onMarginPctChange: jest.fn(),
  };

  beforeEach(() => {
    // V5: role/permissões agora vêm do store (GET /company/permissions).
    // O input de margem fica dentro de PermissionGate allow={COST_VIEW_ROLES}.
    useSessionStore.setState({ permissions: [], role: 'FINANCE' });
  });

  it('renderiza os totais de materiais, serviços e subtotal', async () => {
    await render(<ValoresStep {...defaultProps} />);
    expect(screen.getByText('R$ 1.500,00')).toBeTruthy();
    expect(screen.getByText('R$ 500,00')).toBeTruthy();
    expect(screen.getByText('R$ 2.000,00')).toBeTruthy();
  });

  it('renderiza o total final com desconto aplicado', async () => {
    await render(<ValoresStep {...defaultProps} />);
    expect(screen.getByText('R$ 1.900,00')).toBeTruthy();
  });

  it('chama onDiscountChange ao editar o desconto', async () => {
    const onDiscountChange = jest.fn();
    await render(<ValoresStep {...defaultProps} onDiscountChange={onDiscountChange} />);
    const input = screen.getByLabelText('Desconto');
    await fireEvent.changeText(input, '200');
    expect(onDiscountChange).toHaveBeenCalledWith('200');
  });

  it('chama onMarginPctChange ao editar a margem', async () => {
    const onMarginPctChange = jest.fn();
    await render(<ValoresStep {...defaultProps} onMarginPctChange={onMarginPctChange} />);
    const input = screen.getByLabelText('Margem percentual');
    await fireEvent.changeText(input, '10');
    expect(onMarginPctChange).toHaveBeenCalledWith('10');
  });

  it('role unknown (store vazio) → NÃO renderiza o input de margem (anti-owner)', async () => {
    useSessionStore.setState({ permissions: [], role: null });
    await render(<ValoresStep {...defaultProps} />);
    expect(screen.queryByLabelText('Margem percentual')).toBeNull();
  });
});
