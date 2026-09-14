import {
  fetchAddressByCep,
  isValidCep,
  sanitizeCep,
} from '../cep';

describe('cepService', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = originalFetch;
  });

  describe('sanitizeCep', () => {
    it('remove traços, pontos e espaços', () => {
      expect(sanitizeCep('01310-100')).toBe('01310100');
      expect(sanitizeCep('01.310-100')).toBe('01310100');
      expect(sanitizeCep(' 01310 100 ')).toBe('01310100');
      expect(sanitizeCep('')).toBe('');
    });
  });

  describe('isValidCep', () => {
    it('valida CEPs com 8 dígitos válidos', () => {
      expect(isValidCep('01310-100')).toBe(true);
      expect(isValidCep('01310100')).toBe(true);
    });

    it('rejeita CEPs incompletos ou com dígitos idênticos repetidos', () => {
      expect(isValidCep('12345')).toBe(false);
      expect(isValidCep('00000000')).toBe(false);
      expect(isValidCep('11111111')).toBe(false);
    });
  });

  describe('fetchAddressByCep', () => {
    it('retorna null se o CEP não possuir 8 dígitos', async () => {
      const result = await fetchAddressByCep('123');
      expect(result).toBeNull();
    });

    it('retorna dados com sucesso a partir do ViaCEP', async () => {
      globalThis.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          cep: '01310-100',
          logradouro: 'Avenida Paulista',
          complemento: 'de 611 a 1045 - lado ímpar',
          bairro: 'Bela Vista',
          localidade: 'São Paulo',
          uf: 'SP',
        }),
      } as any);

      const result = await fetchAddressByCep('01310-100');

      expect(result).toEqual({
        cep: '01310-100',
        street: 'Avenida Paulista',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        complement: 'de 611 a 1045 - lado ímpar',
      });
    });

    it('retorna null quando o ViaCEP indica erro (CEP inexistente)', async () => {
      globalThis.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ erro: true }),
      } as any);

      const result = await fetchAddressByCep('99999-999');
      expect(result).toBeNull();
    });

    it('utiliza fallback da BrasilAPI quando ViaCEP falha na requisição', async () => {
      // Primeira chamada (ViaCEP) falha com erro de rede
      // Segunda chamada (BrasilAPI) tem sucesso
      globalThis.fetch = jest
        .fn()
        .mockRejectedValueOnce(new Error('Network error on ViaCEP'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            cep: '01310100',
            state: 'SP',
            city: 'São Paulo',
            neighborhood: 'Bela Vista',
            street: 'Avenida Paulista',
            service: 'correios',
          }),
        } as any);

      const result = await fetchAddressByCep('01310100');

      expect(result).toEqual({
        cep: '01310100',
        street: 'Avenida Paulista',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        complement: '',
      });
    });

    it('retorna null se tanto ViaCEP quanto BrasilAPI falharem', async () => {
      globalThis.fetch = jest
        .fn()
        .mockRejectedValueOnce(new Error('Network error on ViaCEP'))
        .mockRejectedValueOnce(new Error('Network error on BrasilAPI'));

      const result = await fetchAddressByCep('01310100');
      expect(result).toBeNull();
    });
  });
});
