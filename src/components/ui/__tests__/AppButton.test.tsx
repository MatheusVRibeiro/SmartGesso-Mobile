import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import AppButton from '../AppButton';

describe('AppButton', () => {
  it('renderiza o título corretamente', () => {
    render(<AppButton title="Salvar" onPress={() => {}} />);
    expect(screen.getByText('Salvar')).toBeTruthy();
  });

  it('renderiza com variante primária por padrão', () => {
    render(<AppButton title="Enviar" onPress={() => {}} />);
    expect(screen.getByText('Enviar')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeTruthy();
  });

  it('renderiza com variante secondary', () => {
    render(<AppButton title="Cancelar" variant="secondary" onPress={() => {}} />);
    expect(screen.getByText('Cancelar')).toBeTruthy();
  });

  it('renderiza com variante outline', () => {
    render(<AppButton title="Outline" variant="outline" onPress={() => {}} />);
    expect(screen.getByText('Outline')).toBeTruthy();
  });

  it('renderiza com variante danger', () => {
    render(<AppButton title="Excluir" variant="danger" onPress={() => {}} />);
    expect(screen.getByText('Excluir')).toBeTruthy();
  });

  it('renderiza com variante ghost', () => {
    render(<AppButton title="Ghost" variant="ghost" onPress={() => {}} />);
    expect(screen.getByText('Ghost')).toBeTruthy();
  });

  it('chama onPress ao pressionar', () => {
    const onPress = jest.fn();
    render(<AppButton title="Clicar" onPress={onPress} />);
    fireEvent.press(screen.getByText('Clicar'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renderiza label de acessibilidade customizado', () => {
    render(
      <AppButton
        title="OK"
        accessibilityLabel="Confirmar ação"
        onPress={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: 'Confirmar ação' })).toBeTruthy();
  });

  it('renderiza com tamanho sm', () => {
    render(<AppButton title="Pequeno" size="sm" onPress={() => {}} />);
    expect(screen.getByText('Pequeno')).toBeTruthy();
  });

  it('renderiza com tamanho lg', () => {
    render(<AppButton title="Grande" size="lg" onPress={() => {}} />);
    expect(screen.getByText('Grande')).toBeTruthy();
  });
});
