import React from 'react';
import renderer from 'react-test-renderer';
import EmptyState from '../EmptyState';

describe('EmptyState', () => {
  it('renderiza corretamente', () => {
    const tree = renderer.create(
      <EmptyState title="Nenhum dado" description="Volte mais tarde" />
    ).toJSON();
    expect(tree).toBeTruthy();
  });
});