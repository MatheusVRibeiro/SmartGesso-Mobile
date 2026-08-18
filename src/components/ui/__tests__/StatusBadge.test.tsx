import React from 'react';
import { render, screen } from '@testing-library/react-native';
import StatusBadge from '../StatusBadge';

describe('StatusBadge', () => {
  it('renderiza label "Ativo" para status active', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText('Ativo')).toBeTruthy();
  });

  it('renderiza label "Atenção" para status warning', () => {
    render(<StatusBadge status="warning" />);
    expect(screen.getByText('Atenção')).toBeTruthy();
  });

  it('renderiza label "Suspenso" para status suspended', () => {
    render(<StatusBadge status="suspended" />);
    expect(screen.getByText('Suspenso')).toBeTruthy();
  });

  it('renderiza label "Cancelado" para status cancelled', () => {
    render(<StatusBadge status="cancelled" />);
    expect(screen.getByText('Cancelado')).toBeTruthy();
  });

  it('renderiza label "Expirado" para status expired', () => {
    render(<StatusBadge status="expired" />);
    expect(screen.getByText('Expirado')).toBeTruthy();
  });

  it('renderiza label customizado quando fornecido', () => {
    render(<StatusBadge status="active" label="Em uso" />);
    expect(screen.getByText('Em uso')).toBeTruthy();
    expect(screen.queryByText('Ativo')).toBeNull();
  });

  it('renderiza com tamanho sm', () => {
    render(<StatusBadge status="active" size="sm" />);
    expect(screen.getByText('Ativo')).toBeTruthy();
  });

  it('renderiza com tamanho md (padrão)', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText('Ativo')).toBeTruthy();
  });
});
