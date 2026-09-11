import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ClienteStep } from '../ClienteStep';
import type { Client } from '../../../../../types/client';

describe('ClienteStep', () => {
  const mockClient: Client = {
    id: 'client-1',
    companyId: 'company-1',
    type: 'FISICA',
    name: 'João da Silva',
    document: '123.456.789-00',
    email: 'joao@example.com',
    phone: '(11) 99999-9999',
    whatsapp: '(11) 99999-9999',
    status: 'ACTIVE',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  it('renderiza o nome do cliente selecionado', async () => {
    await render(
      <ClienteStep
        clientId="client-1"
        selectedClient={mockClient}
        onOpenClientModal={() => {}}
      />,
    );
    expect(screen.getByText('João da Silva')).toBeTruthy();
  });

  it('renderiza placeholder quando nenhum cliente selecionado', async () => {
    await render(
      <ClienteStep
        clientId=""
        selectedClient={undefined}
        onOpenClientModal={() => {}}
      />,
    );
    expect(screen.getByText('Selecione um cliente')).toBeTruthy();
  });

  it('chama onOpenClientModal ao pressionar "Trocar"', async () => {
    const onOpenClientModal = jest.fn();
    await render(
      <ClienteStep
        clientId="client-1"
        selectedClient={mockClient}
        onOpenClientModal={onOpenClientModal}
      />,
    );
    await fireEvent.press(screen.getByText('Trocar'));
    expect(onOpenClientModal).toHaveBeenCalledTimes(1);
  });
});
