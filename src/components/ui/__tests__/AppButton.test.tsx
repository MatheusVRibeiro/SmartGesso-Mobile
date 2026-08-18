import React from 'react';
import renderer from 'react-test-renderer';
import AppButton from '../AppButton';

describe('AppButton', () => {
  it('renderiza corretamente', () => {
    const tree = renderer.create(
      <AppButton title="Salvar" onPress={() => {}} />
    ).toJSON();
    expect(tree).toBeTruthy();
  });

  it('chama onPress ao pressionar', () => {
    const onPress = jest.fn();
    const instance = renderer.create(
      <AppButton title="Clicar" onPress={onPress} />
    );
    const root = instance.root;
    const touchable = root.findByProps({ accessible: true });
    touchable.props.onPress();
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});