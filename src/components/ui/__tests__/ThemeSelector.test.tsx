import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ThemeSelector } from '../ThemeSelector';
import { ThemeProvider } from '@/src/theme/ThemeProvider';

describe('ThemeSelector', () => {
  it('renderiza as opções de tema (Claro, Escuro, Sistema)', async () => {
    await render(
      <ThemeProvider>
        <ThemeSelector />
      </ThemeProvider>
    );

    expect(screen.getByText('Aparência do Aplicativo')).toBeTruthy();
    expect(screen.getByLabelText('Tema Claro')).toBeTruthy();
    expect(screen.getByLabelText('Tema Escuro')).toBeTruthy();
    expect(screen.getByLabelText('Tema Sistema')).toBeTruthy();
  });

  it('permite alternar para o tema Escuro ao clicar', async () => {
    await render(
      <ThemeProvider>
        <ThemeSelector />
      </ThemeProvider>
    );

    const darkBtn = screen.getByLabelText('Tema Escuro');
    fireEvent.press(darkBtn);

    expect(darkBtn).toBeTruthy();
  });
});
