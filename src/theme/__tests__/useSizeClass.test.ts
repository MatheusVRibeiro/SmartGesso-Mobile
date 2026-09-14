import { renderHook } from '@testing-library/react-native';
import { useWindowDimensions } from 'react-native';
import {
  getSizeClass,
  useSizeClass,
  useSizeClassValue,
  type SizeClass,
} from '../useSizeClass';

// Mock do react-native: o módulo em teste importa apenas useWindowDimensions.
jest.mock('react-native', () => ({
  useWindowDimensions: jest.fn(),
}));

const mockUseWindowDimensions = useWindowDimensions as jest.Mock;

function setWindowWidth(width: number) {
  mockUseWindowDimensions.mockReturnValue({ width, height: 800 });
}

describe('getSizeClass', () => {
  it.each([
    [0, 'compact'],
    [599, 'compact'],
    [600, 'medium'],
    [744, 'medium'],
    [839, 'medium'],
    [840, 'expanded'],
    [1024, 'expanded'],
    [1366, 'expanded'],
  ] as const)('classifica %i dp como %s', (width, expected) => {
    expect(getSizeClass(width)).toBe(expected);
  });
});

describe('useSizeClass', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retorna compact quando a largura da janela é < 600', async () => {
    setWindowWidth(393);

    const { result } = await renderHook(() => useSizeClass());

    expect(result.current).toBe<SizeClass>('compact');
  });

  it('retorna medium quando a largura da janela está entre 600 e 839', async () => {
    setWindowWidth(744);

    const { result } = await renderHook(() => useSizeClass());

    expect(result.current).toBe<SizeClass>('medium');
  });

  it('retorna expanded quando a largura da janela é ≥ 840', async () => {
    setWindowWidth(1366);

    const { result } = await renderHook(() => useSizeClass());

    expect(result.current).toBe<SizeClass>('expanded');
  });
});

describe('useSizeClassValue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retorna o valor de compact quando a largura é < 600', async () => {
    setWindowWidth(393);

    const { result } = await renderHook(() =>
      useSizeClassValue({ compact: 1, medium: 2, expanded: 4 })
    );

    expect(result.current).toBe(1);
  });

  it('retorna o valor de medium quando a largura está entre 600 e 839', async () => {
    setWindowWidth(600);

    const { result } = await renderHook(() =>
      useSizeClassValue({ compact: 1, medium: 2, expanded: 4 })
    );

    expect(result.current).toBe(2);
  });

  it('retorna o valor de expanded quando a largura é ≥ 840', async () => {
    setWindowWidth(840);

    const { result } = await renderHook(() =>
      useSizeClassValue({ compact: 1, medium: 2, expanded: 4 })
    );

    expect(result.current).toBe(4);
  });

  it('funciona com valores de tipos arbitrários (não apenas números)', async () => {
    setWindowWidth(1024);

    const { result } = await renderHook(() =>
      useSizeClassValue({
        compact: 'coluna única',
        medium: 'duas colunas',
        expanded: 'três colunas',
      })
    );

    expect(result.current).toBe('três colunas');
  });
});
