import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import EmptyState from '../EmptyState';

describe('EmptyState', () => {
  it('renderiza o título corretamente', async () => {
    await render(<EmptyState title="Nenhum dado" />);
    expect(screen.getByText('Nenhum dado')).toBeTruthy();
  });

  it('renderiza descrição quando fornecida', async () => {
    await render(
      <EmptyState title="Vazio" description="Volte mais tarde" />
    );
    expect(screen.getByText('Volte mais tarde')).toBeTruthy();
  });

  it('renderiza sem descrição quando não fornecida', async () => {
    await render(<EmptyState title="Sem dados" />);
    expect(screen.getByText('Sem dados')).toBeTruthy();
    expect(screen.queryByText('Volte mais tarde')).toBeNull();
  });

  it('renderiza botão de ação quando actionLabel e onAction são fornecidos', async () => {
    const onAction = jest.fn();
    await render(
      <EmptyState
        title="Nada aqui"
        actionLabel="Adicionar"
        onAction={onAction}
      />
    );
    expect(screen.getByText('Adicionar')).toBeTruthy();
  });

  it('chama onAction ao pressionar o botão', async () => {
    const onAction = jest.fn();
    await render(
      <EmptyState
        title="Vazio"
        actionLabel="Criar novo"
        onAction={onAction}
      />
    );
    await fireEvent.press(screen.getByText('Criar novo'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('não renderiza botão quando onAction não é fornecido', async () => {
    await render(
      <EmptyState title="Sem dados" actionLabel="Ação" />
    );
    expect(screen.queryByText('Ação')).toBeNull();
  });

  it('não renderiza botão quando actionLabel não é fornecido', async () => {
    await render(
      <EmptyState title="Sem dados" onAction={() => {}} />
    );
    expect(screen.queryByText('Adicionar')).toBeNull();
  });
});
