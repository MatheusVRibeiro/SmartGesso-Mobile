import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { AnimatedCounter } from '../AnimatedCounter';

describe('AnimatedCounter', () => {
  it('renderiza valor inicial 0', async () => {
    await render(<AnimatedCounter value={1000} />);
    expect(screen.getByText(/0/)).toBeTruthy();
  });

  it('renderiza prefixo', async () => {
    await render(<AnimatedCounter value={1000} prefix="R$ " />);
    expect(screen.getByText(/R\$/)).toBeTruthy();
  });
});
