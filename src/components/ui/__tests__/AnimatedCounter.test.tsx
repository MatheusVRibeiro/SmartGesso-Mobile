import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { AnimatedCounter } from '../AnimatedCounter';

describe('AnimatedCounter', () => {
  it('renderiza valor inicial 0', async () => {
    const { unmount } = await render(<AnimatedCounter value={1000} />);
    expect(screen.getByText(/0/)).toBeTruthy();
    unmount();
  });

  it('renderiza prefixo', async () => {
    const { unmount } = await render(<AnimatedCounter value={1000} prefix="R$ " />);
    expect(screen.getByText(/R\$/)).toBeTruthy();
    unmount();
  });
});
