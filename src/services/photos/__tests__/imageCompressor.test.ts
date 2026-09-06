import { compressImage } from '../imageCompressor';

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn().mockResolvedValue({
    uri: 'file:///path/to/compressed.jpg',
    width: 1280,
    height: 720,
  }),
  SaveFormat: {
    JPEG: 'jpeg',
  },
}));

describe('Image Compressor', () => {
  it('deve retornar a imagem comprimida com dimensões ajustadas', async () => {
    const result = await compressImage('file:///path/to/original.jpg', {
      maxWidth: 1280,
      quality: 0.75,
    });

    expect(result).toBeDefined();
    expect(result.uri).toBeDefined();
    expect(result.width).toBe(1280);
    expect(result.height).toBe(720);
  });
});
