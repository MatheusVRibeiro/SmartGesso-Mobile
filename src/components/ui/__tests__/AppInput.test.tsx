import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import AppInput from '../AppInput';

describe('AppInput', () => {
  it('renderiza o label corretamente', async () => {
    await render(<AppInput label="Nome" value="" onChangeText={() => {}} />);
    expect(screen.getByText('Nome')).toBeTruthy();
  });

  it('renderiza o campo de entrada', async () => {
    await render(<AppInput label="Email" value="teste@ex.com" onChangeText={() => {}} />);
    expect(screen.getByDisplayValue('teste@ex.com')).toBeTruthy();
  });

  it('chama onChangeText ao digitar', async () => {
    const onChange = jest.fn();
    await render(<AppInput label="Telefone" value="" onChangeText={onChange} />);
    await fireEvent.changeText(screen.getByDisplayValue(''), '(11) 99999-0000');
    expect(onChange).toHaveBeenCalledWith('(11) 99999-0000');
  });

  it('renderiza erro quando fornecido', async () => {
    await render(
      <AppInput
        label="CPF"
        value=""
        onChangeText={() => {}}
        error="CPF é obrigatório"
      />
    );
    expect(screen.getByText('CPF é obrigatório')).toBeTruthy();
  });

  it('renderiza helper quando fornecido e sem erro', async () => {
    await render(
      <AppInput
        label="Senha"
        value=""
        onChangeText={() => {}}
        helper="Mínimo 8 caracteres"
      />
    );
    expect(screen.getByText('Mínimo 8 caracteres')).toBeTruthy();
  });

  it('exibe asterisco de obrigatório', async () => {
    await render(
      <AppInput label="Email" value="" onChangeText={() => {}} required />
    );
    expect(screen.getByText('Email *')).toBeTruthy();
  });

  it('renderiza placeholder', async () => {
    await render(
      <AppInput
        label="Busca"
        value=""
        onChangeText={() => {}}
        placeholder="Buscar..."
      />
    );
    expect(screen.getByPlaceholderText('Buscar...')).toBeTruthy();
  });

  it('renderiza valor vazio', async () => {
    await render(<AppInput label="Campo" value="" onChangeText={() => {}} />);
    expect(screen.getByDisplayValue('')).toBeTruthy();
  });
});
