import React from 'react';
import { render, screen } from '@testing-library/react-native';
import StatusBadge from '../StatusBadge';

describe('StatusBadge', () => {
  it('renderiza label "Ativo" para status active', async () => {
    await render(<StatusBadge status="active" />);
    expect(screen.getByText('Ativo')).toBeTruthy();
  });

  it('renderiza label "Atenção" para status warning', async () => {
    await render(<StatusBadge status="warning" />);
    expect(screen.getByText('Atenção')).toBeTruthy();
  });

  it('renderiza label "Suspenso" para status suspended', async () => {
    await render(<StatusBadge status="suspended" />);
    expect(screen.getByText('Suspenso')).toBeTruthy();
  });

  it('renderiza label "Cancelado" para status cancelled', async () => {
    await render(<StatusBadge status="cancelled" />);
    expect(screen.getByText('Cancelado')).toBeTruthy();
  });

  it('renderiza label "Expirado" para status expired', async () => {
    await render(<StatusBadge status="expired" />);
    expect(screen.getByText('Expirado')).toBeTruthy();
  });

  it('renderiza label customizado quando fornecido', async () => {
    await render(<StatusBadge status="active" label="Em uso" />);
    expect(screen.getByText('Em uso')).toBeTruthy();
    expect(screen.queryByText('Ativo')).toBeNull();
  });

  it('renderiza com tamanho sm', async () => {
    await render(<StatusBadge status="active" size="sm" />);
    expect(screen.getByText('Ativo')).toBeTruthy();
  });

  it('renderiza com tamanho md (padrão)', async () => {
    await render(<StatusBadge status="active" />);
    expect(screen.getByText('Ativo')).toBeTruthy();
  });
});
