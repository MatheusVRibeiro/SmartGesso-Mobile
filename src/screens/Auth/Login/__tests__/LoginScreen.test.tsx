import React from 'react';
import { render, screen } from '@testing-library/react-native';
import LoginScreen from '../index';
import { ThemeProvider } from '@/src/theme/ThemeProvider';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

describe('LoginScreen', () => {
  it('renderiza o formulário de login com campos de e-mail e senha', async () => {
    await render(
      <ThemeProvider>
        <LoginScreen />
      </ThemeProvider>
    );

    expect(screen.getByText('SmartGesso')).toBeTruthy();
    expect(screen.getByText('Acesse sua conta para continuar')).toBeTruthy();
    expect(screen.getByText('E-mail')).toBeTruthy();
    expect(screen.getByText('Senha')).toBeTruthy();
    expect(screen.getByText('Entrar na conta')).toBeTruthy();
    expect(screen.getByText('Esqueci a senha')).toBeTruthy();
  });
});
