import {
  formatCpfCnpj,
  formatPhone,
  formatCep,
  formatCurrencyInput,
  parseCurrencyInput,
} from '../masks';

describe('masks (auto-correção)', () => {
  describe('formatCpfCnpj', () => {
    it('formata CPF progressivamente', () => {
      expect(formatCpfCnpj('1')).toBe('1');
      expect(formatCpfCnpj('123')).toBe('123');
      expect(formatCpfCnpj('1234')).toBe('123.4');
      expect(formatCpfCnpj('12345678901')).toBe('123.456.789-01');
    });

    it('formata CNPJ quando tem 14 dígitos', () => {
      expect(formatCpfCnpj('12345678000199')).toBe('12.345.678/0001-99');
    });

    it('remove caracteres não numéricos', () => {
      expect(formatCpfCnpj('123.456.789-01')).toBe('123.456.789-01');
      expect(formatCpfCnpj('abc123def456')).toBe('123.456');
    });

    it('limita a 14 dígitos', () => {
      expect(formatCpfCnpj('123456789012345678')).toBe('12.345.678/9012-34');
    });
  });

  describe('formatPhone', () => {
    it('formata fixo (10 dígitos)', () => {
      expect(formatPhone('1198765432')).toBe('(11) 9876-5432');
    });

    it('formata celular (11 dígitos)', () => {
      expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
    });

    it('remove caracteres não numéricos', () => {
      expect(formatPhone('(11) 98765-4321')).toBe('(11) 98765-4321');
    });
  });

  describe('formatCep', () => {
    it('formata CEP', () => {
      expect(formatCep('01310100')).toBe('01310-100');
      expect(formatCep('01310')).toBe('01310');
    });
  });

  describe('formatCurrencyInput / parseCurrencyInput', () => {
    it('formata moeda progressivamente (centavos)', () => {
      expect(formatCurrencyInput('1')).toBe('R$ 0,01');
      expect(formatCurrencyInput('1500')).toBe('R$ 15,00');
      expect(formatCurrencyInput('150000')).toBe('R$ 1.500,00');
    });

    it('converte texto formatado de volta para número', () => {
      expect(parseCurrencyInput('R$ 1.500,00')).toBe(1500);
      expect(parseCurrencyInput('1500')).toBe(15);
      expect(parseCurrencyInput('')).toBe(0);
    });

    it('round-trip: formatar e parsear preserva o valor', () => {
      expect(parseCurrencyInput(formatCurrencyInput('123456'))).toBe(1234.56);
    });
  });
});