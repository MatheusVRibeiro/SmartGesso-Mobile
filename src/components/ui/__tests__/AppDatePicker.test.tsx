import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { AppDatePicker } from '../AppDatePicker';

describe('AppDatePicker Component', () => {
  it('deve renderizar o label e o placeholder corretamente', async () => {
    await render(
      <AppDatePicker
        label="Data de início"
        placeholder="Selecione a data"
        onChange={jest.fn()}
      />
    );

    expect(screen.getByText('Data de início')).toBeTruthy();
    expect(screen.getByText('Selecione a data')).toBeTruthy();
  });

  it('deve exibir a data formatada no padrão brasileiro DD/MM/AAAA', async () => {
    await render(
      <AppDatePicker
        label="Data agendada"
        value="2026-08-25"
        onChange={jest.fn()}
      />
    );

    expect(screen.getByText('25/08/2026')).toBeTruthy();
  });

  it('deve abrir o modal de calendário ao pressionar o campo', async () => {
    await render(
      <AppDatePicker
        label="Data agendada"
        value="2026-08-25"
        onChange={jest.fn()}
      />
    );

    const button = screen.getByRole('button', { name: 'Data agendada' });
    await fireEvent.press(button);

    expect(screen.getByText('Selecionar Data agendada')).toBeTruthy();
    expect(screen.getByText('Hoje')).toBeTruthy();
    expect(screen.getByText('Cancelar')).toBeTruthy();
  });

  it('deve chamar onChange com valor ISO e formatado ao selecionar "Hoje"', async () => {
    const mockOnChange = jest.fn();
    await render(
      <AppDatePicker
        label="Data agendada"
        onChange={mockOnChange}
      />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Data agendada' }));
    await fireEvent.press(screen.getByText('Hoje'));

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange.mock.calls[0][0]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(mockOnChange.mock.calls[0][1]).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });
});
