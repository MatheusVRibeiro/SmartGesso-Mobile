import React from 'react';
import renderer from 'react-test-renderer';
import StatusBadge from '../StatusBadge';

describe('StatusBadge', () => {
  it('renderiza corretamente', () => {
    const tree = renderer.create(
      <StatusBadge status="active" />
    ).toJSON();
    expect(tree).toBeTruthy();
  });
});