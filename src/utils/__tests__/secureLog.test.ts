import { safeErrorMessage } from '../secureLog';

describe('safeErrorMessage', () => {
  it('extrai message de Error', () => {
    expect(safeErrorMessage(new Error('Request failed with status code 401'))).toBe(
      'Request failed with status code 401'
    );
  });

  it('extrai message de objetos com message string (ex.: ApiError)', () => {
    expect(safeErrorMessage({ message: 'Erro de rede', code: 'NETWORK_ERROR' })).toBe(
      'Erro de rede'
    );
  });

  it('retorna a string diretamente', () => {
    expect(safeErrorMessage('falha simples')).toBe('falha simples');
  });

  it('NÃO serializa objetos sem message (evita expor headers/tokens)', () => {
    const errorWithSensitiveData = {
      config: { headers: { Authorization: 'Bearer token-secreto' } },
      details: { refreshToken: 'token-secreto' },
    };
    expect(safeErrorMessage(errorWithSensitiveData)).toBe('Erro desconhecido');
  });

  it('nunca vaza o conteúdo do objeto na mensagem', () => {
    const leaked = safeErrorMessage({
      config: { headers: { Authorization: 'Bearer segredo' } },
    });
    expect(leaked).not.toContain('segredo');
    expect(leaked).not.toContain('Bearer');
  });

  it('lida com null/undefined e primitivos', () => {
    expect(safeErrorMessage(null)).toBe('null');
    expect(safeErrorMessage(undefined)).toBe('undefined');
    expect(safeErrorMessage(42)).toBe('42');
  });
});
