import {
  fetchCompanyByCnpj,
  isValidCnpj,
  sanitizeCnpj,
} from '../cnpj';

describe('cnpjService', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = originalFetch;
  });

  describe('sanitizeCnpj', () => {
    it('remove caracteres nao numericos', () => {
      expect(sanitizeCnpj('00.000.000/0001-91')).toBe('00000000000191');
      expect(sanitizeCnpj('12.345.678/0001-00')).toBe('12345678000100');
      expect(sanitizeCnpj('')).toBe('');
    });
  });

  describe('isValidCnpj', () => {
    it('valida CNPJ de 14 digitos', () => {
      expect(isValidCnpj('00.000.000/0001-91')).toBe(true);
      expect(isValidCnpj('12345678000100')).toBe(true);
    });

    it('rejeita CNPJ incompleto ou com digitos repetidos', () => {
      expect(isValidCnpj('12345')).toBe(false);
      expect(isValidCnpj('11111111111111')).toBe(false);
      expect(isValidCnpj('00000000000000')).toBe(false);
    });
  });

  describe('fetchCompanyByCnpj', () => {
    it('retorna null se CNPJ nao possuir 14 digitos', async () => {
      const result = await fetchCompanyByCnpj('12345');
      expect(result).toBeNull();
    });

    it('retorna dados com sucesso a partir da BrasilAPI', async () => {
      globalThis.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          cnpj: '00000000000191',
          razao_social: 'BANCO DO BRASIL SA',
          nome_fantasia: 'DIRECAO GERAL',
          cep: '70073901',
          logradouro: 'SBS QUADRA 1 BLOCO C',
          numero: 'SN',
          bairro: 'ASA SUL',
          municipio: 'BRASILIA',
          uf: 'DF',
          ddd_telefone_1: '6134939002',
          email: 'gecex@bb.com.br',
        }),
      } as any);

      const result = await fetchCompanyByCnpj('00.000.000/0001-91');

      expect(result).toEqual({
        cnpj: '00000000000191',
        razaoSocial: 'BANCO DO BRASIL SA',
        nomeFantasia: 'DIRECAO GERAL',
        cep: '70073901',
        logradouro: 'SBS QUADRA 1 BLOCO C',
        numero: 'SN',
        complemento: '',
        bairro: 'ASA SUL',
        municipio: 'BRASILIA',
        uf: 'DF',
        telefone: '6134939002',
        email: 'gecex@bb.com.br',
      });
    });

    it('utiliza fallback do MinhaReceita quando BrasilAPI falha', async () => {
      globalThis.fetch = jest
        .fn()
        .mockRejectedValueOnce(new Error('BrasilAPI timeout'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            cnpj: '00000000000191',
            razao_social: 'BANCO DO BRASIL SA',
            nome_fantasia: 'DIRECAO GERAL',
            cep: '70073901',
            logradouro: 'SBS QUADRA 1 BLOCO C',
            numero: 'SN',
            bairro: 'ASA SUL',
            municipio: 'BRASILIA',
            uf: 'DF',
          }),
        } as any);

      const result = await fetchCompanyByCnpj('00000000000191');

      expect(result?.razaoSocial).toBe('BANCO DO BRASIL SA');
      expect(result?.uf).toBe('DF');
    });

    it('retorna null quando ambas as APIs falharem', async () => {
      globalThis.fetch = jest
        .fn()
        .mockRejectedValueOnce(new Error('BrasilAPI error'))
        .mockRejectedValueOnce(new Error('MinhaReceita error'));

      const result = await fetchCompanyByCnpj('00000000000191');
      expect(result).toBeNull();
    });
  });
});
