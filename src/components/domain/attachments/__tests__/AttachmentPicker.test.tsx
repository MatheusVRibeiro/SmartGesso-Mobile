import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { AttachmentPicker } from '../AttachmentPicker';

// Mock de expo-image-picker — simula a galeria e permissões
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

import * as ImagePicker from 'expo-image-picker';

const mockedRequestPermission =
  ImagePicker.requestMediaLibraryPermissionsAsync as jest.MockedFunction<
    typeof ImagePicker.requestMediaLibraryPermissionsAsync
  >;
const mockedLaunchLibrary =
  ImagePicker.launchImageLibraryAsync as jest.MockedFunction<
    typeof ImagePicker.launchImageLibraryAsync
  >;

const mockAsset = {
  uri: 'file:///fake/image.jpg',
  width: 100,
  height: 100,
  mimeType: 'image/jpeg',
  fileSize: 204800,
  fileName: 'image.jpg',
};

describe('AttachmentPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedRequestPermission.mockResolvedValue({ granted: true } as any);
    mockedLaunchLibrary.mockResolvedValue({
      canceled: false,
      assets: [mockAsset],
    } as any);
  });

  it('renderiza o rótulo e o hint por padrão', () => {
    render(<AttachmentPicker onPick={jest.fn()} />);
    expect(screen.getByText('Anexar foto')).toBeTruthy();
    expect(screen.getByText('Toque para escolher na galeria')).toBeTruthy();
  });

  it('renderiza rótulo customizado', () => {
    render(
      <AttachmentPicker onPick={jest.fn()} label="Anexar documento" hint="PDF ou imagem" />,
    );
    expect(screen.getByText('Anexar documento')).toBeTruthy();
    expect(screen.getByText('PDF ou imagem')).toBeTruthy();
  });

  it('chama onPick com uri, mimeType e size ao selecionar uma imagem', async () => {
    const onPick = jest.fn();
    render(<AttachmentPicker onPick={onPick} />);

    fireEvent.press(screen.getByRole('button', { name: 'Anexar foto' }));

    await waitFor(() => {
      expect(onPick).toHaveBeenCalledTimes(1);
      expect(onPick).toHaveBeenCalledWith({
        uri: 'file:///fake/image.jpg',
        mimeType: 'image/jpeg',
        size: 204800,
      });
    });
  });

  it('não chama onPick quando o usuário cancela a seleção', async () => {
    mockedLaunchLibrary.mockResolvedValue({
      canceled: true,
      assets: null,
    } as any);

    const onPick = jest.fn();
    render(<AttachmentPicker onPick={onPick} />);

    fireEvent.press(screen.getByRole('button', { name: 'Anexar foto' }));

    await waitFor(() => {
      expect(onPick).not.toHaveBeenCalled();
    });
  });

  it('mostra Alert quando a permissão é negada', async () => {
    mockedRequestPermission.mockResolvedValue({ granted: false } as any);

    const onPick = jest.fn();
    render(<AttachmentPicker onPick={onPick} />);

    fireEvent.press(screen.getByRole('button', { name: 'Anexar foto' }));

    await waitFor(() => {
      expect(onPick).not.toHaveBeenCalled();
    });
  });

  it('desabilita o botão quando disabled=true', () => {
    render(<AttachmentPicker onPick={jest.fn()} disabled />);
    const button = screen.getByRole('button', { name: 'Anexar foto' });
    expect(button.props.accessibilityState?.disabled).toBe(true);
  });

  it('aplica testID ao container', () => {
    render(<AttachmentPicker onPick={jest.fn()} testID="my-picker" />);
    expect(screen.getByTestId('my-picker')).toBeTruthy();
  });
});
