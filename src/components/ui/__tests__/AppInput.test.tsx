import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import AppInput from '../AppInput';

describe('AppInput', () => {
  it('renderiza o label corretamente', () => {
    render(<AppInput label="Nome" value="" onChangeText={() => {}} />);
    expect(screen.getByText('Nome')).toBeTruthy();
  });

  it('renderiza o campo de entrada', () => {
    render(<AppInput label="Email" value="teste@ex.com" onChangeText={() => {}} />);
    expect(screen.getByDisplayValue('teste@ex.com')).toBeTruthy();
  });

  it('chama onChangeText ao digitar', () => {
    const onChange = jest.fn();
    render(<AppInput label="Telefone" value="" onChangeText={onChange} />);
    fireEvent.changeText(screen.getByDisplayValue(''), '(11) 99999-0000');
    expect(onChange).toHaveBeenCalledWith('(11) 99999-0000');
  });

  it('renderiza erro quando fornecido', () => {
    render(
      <AppInput
        label="CPF"
        value=""
        onChangeText={() => {}}
        error="CPF é obrigatório"
      />
    );
    expect(screen.getByText('CPF é obrigatório')).toBeTruthy();
  });

  it('renderiza helper quando fornecido e sem erro', () => {
    render(
      <AppInput
        label="Senha"
        value=""
        onChangeText={() => {}}
        helper="Mínimo 8 caracteres"
      />
    );
    expect(screen.getByText('Mínimo 8 caracteres')).toBeTruthy();
  });

  it('exibe asterisco de obrigatório', () => {
    render(
      <AppInput label="Email" value="" onChangeText={() => {}} required />
    );
    expect(screen.getByText('Email *')).toBeTruthy();
  });

  it('renderiza placeholder', () => {
    render(
      <AppInput
        label="Busca"
        value=""
        onChangeText={() => {}}
        placeholder="Buscar..."
      />
    );
    expect(screen.getByPlaceholderText('Buscar...')).toBeTruthy();
  });

  it('renderiza valor vazio', () => {
    render(<AppInput label="Campo" value="" onChangeText={() => {}} />);
    expect(screen.getByDisplayValue('')).toBeTruthy();
  });
});
