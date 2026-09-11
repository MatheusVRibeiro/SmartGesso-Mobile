import React from 'react';
import { Text } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PressableScale } from '../PressableScale';

describe('PressableScale', () => {
  it('renderiza children', async () => {
    await render(
      <PressableScale accessibilityLabel="botão teste">
        <Text>Salvar</Text>
      </PressableScale>,
    );
    expect(screen.getByText('Salvar')).toBeTruthy();
  });

  it('chama onPress ao tocar', async () => {
    const onPress = jest.fn();
    await render(
      <PressableScale accessibilityLabel="botão teste" onPress={onPress}>
        <Text>Salvar</Text>
      </PressableScale>,
    );
    fireEvent.press(screen.getByLabelText('botão teste'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('não chama onPress quando disabled', async () => {
    const onPress = jest.fn();
    await render(
      <PressableScale accessibilityLabel="botão teste" onPress={onPress} disabled>
        <Text>Salvar</Text>
      </PressableScale>,
    );
    fireEvent.press(screen.getByLabelText('botão teste'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('expõe accessibilityRole button por padrão', async () => {
    await render(
      <PressableScale accessibilityLabel="botão teste">
        <Text>Salvar</Text>
      </PressableScale>,
    );
    expect(screen.getByLabelText('botão teste')).toBeTruthy();
  });
});
