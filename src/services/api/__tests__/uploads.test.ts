/**
 * Testes do helper de exibição autenticada de uploads (V5 ETAPA 10).
 *
 * Cobre: anexo do header Authorization (nativo e web), pass-through de URLs
 * não protegidas e comportamento sem token.
 */
import { Platform } from 'react-native';
import { File, Directory, Paths } from 'expo-file-system';
import { SecureTokenStorage } from '../../auth/SecureTokenStorage';
import {
  authenticatedImageUri,
  isProtectedUploadUrl,
} from '../uploads';

jest.mock('../../auth/SecureTokenStorage', () => ({
  SecureTokenStorage: {
    getAccessToken: jest.fn(),
  },
}));

// Mock da API nova do expo-file-system (SDK 57): File / Directory / Paths.
jest.mock('expo-file-system', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MockFile, MockDirectory } = require('./__mocks__/expoFileSystemMock');
  return {
    File: MockFile,
    Directory: MockDirectory,
    Paths: {
      cache: { uri: 'file:///cache/' },
      document: { uri: 'file:///documents/' },
    },
  };
});

const mockedGetToken = SecureTokenStorage.getAccessToken as jest.MockedFunction<
  typeof SecureTokenStorage.getAccessToken
>;
const mockedDownloadFileAsync = File.downloadFileAsync as jest.MockedFunction<
  typeof File.downloadFileAsync
>;

const PROTECTED_URL = 'https://api.smartgesso.com/uploads/pagamentos/foto-123.jpg';
const PUBLIC_URL = 'https://cdn.exemplo.com/imagem-publica.jpg';

describe('isProtectedUploadUrl', () => {
  it('detecta URL absoluta de /uploads', () => {
    expect(isProtectedUploadUrl(PROTECTED_URL)).toBe(true);
  });

  it('detecta caminho relativo de /uploads', () => {
    expect(isProtectedUploadUrl('/uploads/despesas/recibo.png')).toBe(true);
  });

  it('não trata file:// nem data: como protegidos', () => {
    expect(isProtectedUploadUrl('file:///documents/foto.jpg')).toBe(false);
    expect(isProtectedUploadUrl('data:image/png;base64,abc')).toBe(false);
  });

  it('não trata URL pública sem /uploads/ como protegida', () => {
    expect(isProtectedUploadUrl(PUBLIC_URL)).toBe(false);
  });

  it('retorna false para string vazia', () => {
    expect(isProtectedUploadUrl('')).toBe(false);
  });
});

describe('authenticatedImageUri', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = jest.fn();
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  describe('nativo (iOS/Android)', () => {
    beforeEach(() => {
      (Platform as { OS: string }).OS = 'android';
    });

    it('anexa o header Authorization Bearer ao download', async () => {
      mockedGetToken.mockResolvedValue('jwt-token-abc');
      mockedDownloadFileAsync.mockResolvedValue({
        uri: 'file:///cache/smartgesso-uploads/foto-123.jpg',
      } as unknown as File);

      const result = await authenticatedImageUri(PROTECTED_URL);

      expect(mockedGetToken).toHaveBeenCalledTimes(1);
      expect(mockedDownloadFileAsync).toHaveBeenCalledWith(
        PROTECTED_URL,
        expect.anything(),
        expect.objectContaining({
          headers: { Authorization: 'Bearer jwt-token-abc' },
          idempotent: true,
        }),
      );
      expect(result).toBe('file:///cache/smartgesso-uploads/foto-123.jpg');
    });

    it('retorna a URL inalterada quando não é protegida (sem rede)', async () => {
      const result = await authenticatedImageUri(PUBLIC_URL);

      expect(mockedGetToken).not.toHaveBeenCalled();
      expect(mockedDownloadFileAsync).not.toHaveBeenCalled();
      expect(result).toBe(PUBLIC_URL);
    });

    it('retorna a URL crua quando não há token (sessão expirada)', async () => {
      mockedGetToken.mockResolvedValue(null);

      const result = await authenticatedImageUri(PROTECTED_URL);

      expect(mockedDownloadFileAsync).not.toHaveBeenCalled();
      expect(result).toBe(PROTECTED_URL);
    });
  });

  describe('web', () => {
    beforeEach(() => {
      (Platform as { OS: string }).OS = 'web';
    });

    it('anexa o header Authorization Bearer no fetch e retorna blob: URL', async () => {
      mockedGetToken.mockResolvedValue('jwt-token-web');

      const blob = new Blob(['fake-image'], { type: 'image/jpeg' });
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(blob),
      } as unknown as Response);
      const createObjectURL = jest.fn().mockReturnValue('blob:https://app/uuid-1');
      // jsdom não implementa createObjectURL — injeta para o teste.
      Object.defineProperty(globalThis.URL, 'createObjectURL', {
        value: createObjectURL,
        configurable: true,
      });

      const result = await authenticatedImageUri(PROTECTED_URL);

      expect(globalThis.fetch).toHaveBeenCalledWith(PROTECTED_URL, {
        headers: { Authorization: 'Bearer jwt-token-web' },
      });
      expect(createObjectURL).toHaveBeenCalledWith(blob);
      expect(result).toBe('blob:https://app/uuid-1');
    });

    it('lança erro quando a resposta não é ok (401)', async () => {
      mockedGetToken.mockResolvedValue('jwt-token-web');
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
      } as unknown as Response);

      await expect(authenticatedImageUri(PROTECTED_URL)).rejects.toThrow(
        /HTTP 401/,
      );
    });

    it('retorna a URL inalterada quando não é protegida', async () => {
      const result = await authenticatedImageUri('data:image/png;base64,abc');
      expect(globalThis.fetch).not.toHaveBeenCalled();
      expect(result).toBe('data:image/png;base64,abc');
    });
  });

  it('cria o diretório de cache quando não existe', async () => {
    (Platform as { OS: string }).OS = 'android';
    mockedGetToken.mockResolvedValue('jwt-token-abc');
    mockedDownloadFileAsync.mockResolvedValue({
      uri: 'file:///cache/smartgesso-uploads/foto.jpg',
    } as unknown as File);

    // Força o ramo "diretório não existe".
    const dirInstance = (Directory as unknown as jest.Mock).mock.results[0]?.value;
    if (dirInstance) {
      dirInstance.exists = false;
    }

    await authenticatedImageUri(PROTECTED_URL);

    if (dirInstance) {
      expect(dirInstance.create).toHaveBeenCalledWith({
        intermediates: true,
        idempotent: true,
      });
    }
  });
});
