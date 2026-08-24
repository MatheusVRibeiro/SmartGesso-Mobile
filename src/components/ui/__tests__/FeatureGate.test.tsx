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

  it('renderiza children quando feature está habilitada', () => {
    mockedUseCompanyFeatures.mockReturnValue({
      data: ['production', 'inventory'],
      isLoading: false,
      error: null,
    } as any);

    render(
      <FeatureGate feature="production">
        <View testID="content">
          <Text>Conteúdo protegido</Text>
        </View>
      </FeatureGate>
    );

    expect(screen.getByTestId('content')).toBeTruthy();
    expect(screen.getByText('Conteúdo protegido')).toBeTruthy();
  });

  it('renderiza fallback quando feature não está habilitada', () => {
    mockedUseCompanyFeatures.mockReturnValue({
      data: ['inventory'],
      isLoading: false,
      error: null,
    } as any);

    render(
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

  it('renderiza null quando feature não está habilitada e não há fallback', () => {
    mockedUseCompanyFeatures.mockReturnValue({
      data: ['inventory'],
      isLoading: false,
      error: null,
    } as any);

    render(
      <FeatureGate feature="production">
        <View testID="content">
          <Text>Conteúdo protegido</Text>
        </View>
      </FeatureGate>
    );

    expect(screen.queryByTestId('content')).toBeNull();
  });

  it('renderiza fallback durante carregamento', () => {
    mockedUseCompanyFeatures.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(
      <FeatureGate feature="production" fallback={
        <View testID="fallback">
          <Text>Carregando...</Text>
        </View>
      }>
        <View testID="content">
          <Text>Conteúdo protegido</Text>
        </View>
      </FeatureGate>
    );

    expect(screen.getByTestId('fallback')).toBeTruthy();
    expect(screen.getByText('Carregando...')).toBeTruthy();
    expect(screen.queryByTestId('content')).toBeNull();
  });

  it('renderiza children quando features não estão definidas (undefined)', () => {
    mockedUseCompanyFeatures.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as any);

    render(
      <FeatureGate feature="production">
        <View testID="content">
          <Text>Conteúdo protegido</Text>
        </View>
      </FeatureGate>
    );

    expect(screen.getByTestId('content')).toBeTruthy();
    expect(screen.getByText('Conteúdo protegido')).toBeTruthy();
  });
});