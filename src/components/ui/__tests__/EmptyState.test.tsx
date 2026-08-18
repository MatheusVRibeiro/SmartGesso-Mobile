import React from 'react';
import renderer from 'react-test-renderer';
import EmptyState from '../EmptyState';

describe('EmptyState', () => {
  it('renderiza com título e descrição', () => {
    const instance = renderer.create(
      <EmptyState title="Nenhum dado" description="Volte mais tarde" />
    );
    const root = instance.root;
    const textInstances = root.findAllByType('Text');
    const texts = textInstances.map((t: any) => t.props.children);
    expect(texts).toContain('Nenhum dado');
    expect(texts).toContain('Volte mais tarde');
  });
});