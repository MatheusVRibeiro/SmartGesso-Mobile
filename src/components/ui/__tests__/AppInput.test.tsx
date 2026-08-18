import React from 'react';
import renderer from 'react-test-renderer';
import AppInput from '../AppInput';

describe('AppInput', () => {
  it('renderiza corretamente', () => {
    const tree = renderer.create(
      <AppInput label="Nome" value="" onChangeText={() => {}} />
    ).toJSON();
    expect(tree).toBeTruthy();
  });
});