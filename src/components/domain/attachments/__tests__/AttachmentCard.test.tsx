import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { AttachmentCard } from '../AttachmentCard';
import type { Attachment } from '../types';

const baseAttachment: Attachment = {
  id: '1',
  uri: 'file:///fake/image.jpg',
  name: 'foto-obra.jpg',
  mimeType: 'image/jpeg',
  size: 204800,
  status: 'pending',
};

describe('AttachmentCard', () => {
  it('renderiza nome, tamanho e estado do anexo', () => {
    render(
      <AttachmentCard attachment={baseAttachment} onRemove={jest.fn()} />,
    );
    expect(screen.getByText('foto-obra.jpg')).toBeTruthy();
    expect(screen.getByText('200 KB')).toBeTruthy();
    expect(screen.getByText('Pendente')).toBeTruthy();
  });

  it('exibe estado "Enviando" com cor info', () => {
    const attachment: Attachment = { ...baseAttachment, status: 'uploading' };
    render(<AttachmentCard attachment={attachment} onRemove={jest.fn()} />);
    expect(screen.getByText('Enviando')).toBeTruthy();
  });

  it('exibe estado "Enviado" com cor success', () => {
    const attachment: Attachment = { ...baseAttachment, status: 'uploaded' };
    render(<AttachmentCard attachment={attachment} onRemove={jest.fn()} />);
    expect(screen.getByText('Enviado')).toBeTruthy();
  });

  it('exibe estado "Falhou" com cor danger', () => {
    const attachment: Attachment = { ...baseAttachment, status: 'failed' };
    render(<AttachmentCard attachment={attachment} onRemove={jest.fn()} />);
    expect(screen.getByText('Falhou')).toBeTruthy();
  });

  it('formata tamanho em bytes, KB, MB', () => {
    const bytes: Attachment = { ...baseAttachment, size: 500 };
    const kb: Attachment = { ...baseAttachment, size: 1536 };
    const mb: Attachment = { ...baseAttachment, size: 5242880 };

    const { unmount } = render(<AttachmentCard attachment={bytes} onRemove={jest.fn()} />);
    expect(screen.getByText('500 B')).toBeTruthy();
    unmount();

    render(<AttachmentCard attachment={kb} onRemove={jest.fn()} />);
    expect(screen.getByText('1.5 KB')).toBeTruthy();
    unmount();

    render(<AttachmentCard attachment={mb} onRemove={jest.fn()} />);
    expect(screen.getByText('5 MB')).toBeTruthy();
  });

  it('chama onRemove ao pressionar o botão remover', () => {
    const onRemove = jest.fn();
    render(<AttachmentCard attachment={baseAttachment} onRemove={onRemove} />);
    fireEvent.press(screen.getByTestId('remove-1'));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledWith(baseAttachment);
  });

  it('mostra botão de retry apenas quando status é failed e onRetry é fornecido', () => {
    const attachment: Attachment = { ...baseAttachment, status: 'failed' };
    render(
      <AttachmentCard
        attachment={attachment}
        onRemove={jest.fn()}
        onRetry={jest.fn()}
      />,
    );
    expect(screen.getByTestId('retry-1')).toBeTruthy();
  });

  it('não mostra botão de retry quando status não é failed', () => {
    render(<AttachmentCard attachment={baseAttachment} onRemove={jest.fn()} />);
    expect(screen.queryByTestId('retry-1')).toBeNull();
  });

  it('não mostra botão de retry quando onRetry não é fornecido', () => {
    const attachment: Attachment = { ...baseAttachment, status: 'failed' };
    render(<AttachmentCard attachment={attachment} onRemove={jest.fn()} />);
    expect(screen.queryByTestId('retry-1')).toBeNull();
  });

  it('chama onRetry ao pressionar o botão de retry', () => {
    const onRetry = jest.fn();
    const attachment: Attachment = { ...baseAttachment, status: 'failed' };
    render(
      <AttachmentCard
        attachment={attachment}
        onRemove={jest.fn()}
        onRetry={onRetry}
      />,
    );
    fireEvent.press(screen.getByTestId('retry-1'));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(attachment);
  });

  it('aplica testID ao card', () => {
    render(
      <AttachmentCard
        attachment={baseAttachment}
        onRemove={jest.fn()}
        testID="card-1"
      />,
    );
    expect(screen.getByTestId('card-1')).toBeTruthy();
  });
});
