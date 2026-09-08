import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { FeatureGate } from '../FeatureGate';
import { useCompanyFeatures } from '../../../services/api/companyFeatures';

jest.mock('../../../services/api/companyFeatures', () => ({
  useCompanyFeatures: jest.fn(),
}));

const mockedUseCompanyFeatures = useCompanyFeatures as jest.MockedFunction<typeof useCompanyFeatures>;

describe('FeatureGate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza children quando feature está habilitada', async () => {
    mockedUseCompanyFeatures.mockReturnValue({
      data: ['production', 'inventory'],
      isLoading: false,
      error: null,
    } as any);

    await render(
      <FeatureGate feature="production">
        <View testID="content">
          <Text>Conteúdo protegido</Text>
        </View>
      </FeatureGate>
    );

    expect(screen.getByTestId('content')).toBeTruthy();
    expect(screen.getByText('Conteúdo protegido')).toBeTruthy();
  });

  it('renderiza fallback quando feature não está habilitada', async () => {
    mockedUseCompanyFeatures.mockReturnValue({
      data: ['inventory'],
      isLoading: false,
      error: null,
    } as any);

    await render(
      <FeatureGate feature="production" fallback={
        <View testID="fallback">
          <Text>Fallback</Text>
        </View>
      }>
        <View testID="content">
          <Text>Conteúdo protegido</Text>
        </View>
      </FeatureGate>
    );

    expect(screen.getByTestId('fallback')).toBeTruthy();
    expect(screen.getByText('Fallback')).toBeTruthy();
    expect(screen.queryByTestId('content')).toBeNull();
  });

  it('renderiza null quando feature não está habilitada e não há fallback', async () => {
    mockedUseCompanyFeatures.mockReturnValue({
      data: ['inventory'],
      isLoading: false,
      error: null,
    } as any);

    await render(
      <FeatureGate feature="production">
        <View testID="content">
          <Text>Conteúdo protegido</Text>
        </View>
      </FeatureGate>
    );

    expect(screen.queryByTestId('content')).toBeNull();
  });

  it('renderiza children durante carregamento (fail-open, V5 ETAPA 7)', async () => {
    // Fail-open: enquanto a query carrega, mantemos o conteúdo visível para
    // evitar flicker de menu — o backend continua sendo a autoridade.
    mockedUseCompanyFeatures.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    await render(
      <FeatureGate feature="production">
        <View testID="content">
          <Text>Conteúdo protegido</Text>
        </View>
      </FeatureGate>
    );

    expect(screen.getByTestId('content')).toBeTruthy();
    expect(screen.getByText('Conteúdo protegido')).toBeTruthy();
  });

  it('renderiza children em erro da query (fail-open, V5 ETAPA 7)', async () => {
    // Fail-open: em erro da query mantemos o conteúdo visível — o backend
    // continua sendo a autoridade das features.
    mockedUseCompanyFeatures.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('network'),
    } as any);

    await render(
      <FeatureGate feature="production">
        <View testID="content">
          <Text>Conteúdo protegido</Text>
        </View>
      </FeatureGate>
    );

    expect(screen.getByTestId('content')).toBeTruthy();
  });

  it('repassa accessibilityLabel ao filho renderizado', async () => {
    mockedUseCompanyFeatures.mockReturnValue({
      data: ['production'],
      isLoading: false,
      error: null,
    } as any);

    await render(
      <FeatureGate feature="production" accessibilityLabel="Nova produção">
        <View testID="gated">
          <Text>Botão</Text>
        </View>
      </FeatureGate>
    );

    expect(screen.getByLabelText('Nova produção')).toBeTruthy();
    expect(screen.getByTestId('gated')).toBeTruthy();
  });

  it('suporta resposta de features embrulhada em objeto sem estourar TypeError', async () => {
    mockedUseCompanyFeatures.mockReturnValue({
      data: { features: ['production'] },
      isLoading: false,
      error: null,
    } as any);

    await render(
      <FeatureGate feature="production">
        <View testID="content">
          <Text>Conteúdo protegido</Text>
        </View>
      </FeatureGate>
    );

    expect(screen.getByTestId('content')).toBeTruthy();
  });
});
