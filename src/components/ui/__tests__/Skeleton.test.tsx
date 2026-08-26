import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Skeleton, SkeletonList } from '../Skeleton';

describe('Skeleton', () => {
  it('renderiza com testID skeleton', async () => {
    await render(<Skeleton />);
    expect(screen.getByTestId('skeleton')).toBeTruthy();
  });

  it('aceita dimensões customizadas', async () => {
    await render(<Skeleton width={120} height={24} />);
    expect(screen.getByTestId('skeleton')).toBeTruthy();
  });

  it('aceita shimmer=false (estático)', async () => {
    await render(<Skeleton shimmer={false} />);
    expect(screen.getByTestId('skeleton')).toBeTruthy();
  });

  it('aceita highlightColor customizado', async () => {
    await render(<Skeleton highlightColor="#FF0000" />);
    expect(screen.getByTestId('skeleton')).toBeTruthy();
  });

  it('SkeletonList renderiza N linhas', async () => {
    await render(<SkeletonList rows={3} />);
    expect(screen.getAllByTestId('skeleton')).toHaveLength(9);
  });

  it('SkeletonList aceita shimmer=false', async () => {
    await render(<SkeletonList rows={2} shimmer={false} />);
    expect(screen.getAllByTestId('skeleton')).toHaveLength(6);
  });
});
