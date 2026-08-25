import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import AppButton from '../AppButton';

describe('AppButton', () => {
  it('renderiza o título corretamente', async () => {
    await render(<AppButton title="Salvar" onPress={() => {}} />);
    expect(screen.getByText('Salvar')).toBeTruthy();
  });

  it('renderiza com variante primária por padrão', async () => {
    await render(<AppButton title="Enviar" onPress={() => {}} />);
    expect(screen.getByText('Enviar')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeTruthy();
  });

  it('renderiza com variante secondary', async () => {
    await render(<AppButton title="Cancelar" variant="secondary" onPress={() => {}} />);
    expect(screen.getByText('Cancelar')).toBeTruthy();
  });

  it('renderiza com variante outline', async () => {
    await render(<AppButton title="Outline" variant="outline" onPress={() => {}} />);
    expect(screen.getByText('Outline')).toBeTruthy();
  });

  it('renderiza com variante danger', async () => {
    await render(<AppButton title="Excluir" variant="danger" onPress={() => {}} />);
    expect(screen.getByText('Excluir')).toBeTruthy();
  });

  it('renderiza com variante ghost', async () => {
    await render(<AppButton title="Ghost" variant="ghost" onPress={() => {}} />);
    expect(screen.getByText('Ghost')).toBeTruthy();
  });

  it('chama onPress ao pressionar', async () => {
    const onPress = jest.fn();
    await render(<AppButton title="Clicar" onPress={onPress} />);
    await fireEvent.press(screen.getByText('Clicar'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renderiza label de acessibilidade customizado', async () => {
    await render(
      <AppButton
        title="OK"
        accessibilityLabel="Confirmar ação"
        onPress={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: 'Confirmar ação' })).toBeTruthy();
  });

  it('renderiza com tamanho sm', async () => {
    await render(<AppButton title="Pequeno" size="sm" onPress={() => {}} />);
    expect(screen.getByText('Pequeno')).toBeTruthy();
  });

  it('renderiza com tamanho lg', async () => {
    await render(<AppButton title="Grande" size="lg" onPress={() => {}} />);
    expect(screen.getByText('Grande')).toBeTruthy();
  });
});
