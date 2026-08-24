import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ValoresStep } from '../ValoresStep';

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

  it('renderiza os totais de materiais, serviços e subtotal', () => {
    render(<ValoresStep {...defaultProps} />);
    expect(screen.getByText('R$ 1.500,00')).toBeTruthy();
    expect(screen.getByText('R$ 500,00')).toBeTruthy();
    expect(screen.getByText('R$ 2.000,00')).toBeTruthy();
  });

  it('renderiza o total final com desconto aplicado', () => {
    render(<ValoresStep {...defaultProps} />);
    expect(screen.getByText('R$ 1.900,00')).toBeTruthy();
  });

  it('chama onDiscountChange ao editar o desconto', () => {
    const onDiscountChange = jest.fn();
    render(<ValoresStep {...defaultProps} onDiscountChange={onDiscountChange} />);
    const input = screen.getByLabelText('Desconto');
    fireEvent.changeText(input, '200');
    expect(onDiscountChange).toHaveBeenCalledWith('200');
  });

  it('chama onMarginPctChange ao editar a margem', () => {
    const onMarginPctChange = jest.fn();
    render(<ValoresStep {...defaultProps} onMarginPctChange={onMarginPctChange} />);
    const input = screen.getByLabelText('Margem percentual');
    fireEvent.changeText(input, '10');
    expect(onMarginPctChange).toHaveBeenCalledWith('10');
  });
});
