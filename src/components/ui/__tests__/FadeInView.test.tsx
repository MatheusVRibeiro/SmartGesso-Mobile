import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { FadeInView } from '../FadeInView';

describe('FadeInView', () => {
  it('renderiza children', async () => {
    await render(
      <FadeInView>
        <Text>Conteúdo</Text>
      </FadeInView>,
    );
    expect(screen.getByText('Conteúdo')).toBeTruthy();
  });

  it('aceita duration e delay customizados', async () => {
    await render(
      <FadeInView duration={500} delay={100}>
        <Text>Stagger</Text>
      </FadeInView>,
    );
    expect(screen.getByText('Stagger')).toBeTruthy();
  });

  it('aceita deslocamento vertical customizado', async () => {
    await render(
      <FadeInView translateY={16}>
        <Text>Slide</Text>
      </FadeInView>,
    );
    expect(screen.getByText('Slide')).toBeTruthy();
  });
});
