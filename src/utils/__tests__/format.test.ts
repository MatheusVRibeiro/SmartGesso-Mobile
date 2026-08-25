import { formatCurrency, formatNumber, formatQuoteCode } from '../format';

describe('format (formatação pt-BR)', () => {
  describe('formatCurrency', () => {
    it('formata valores como moeda BRL', () => {
      expect(formatCurrency(12.5)).toBe('R$\u00A012,50');
      expect(formatCurrency(0)).toBe('R$\u00A00,00');
      expect(formatCurrency(1234567.89)).toBe('R$\u00A01.234.567,89');
    });

    it('retorna "—" para null/undefined/NaN', () => {
      expect(formatCurrency(null)).toBe('—');
      expect(formatCurrency(undefined)).toBe('—');
      expect(formatCurrency(Number.NaN)).toBe('—');
    });

    it('arredonda para 2 casas decimais', () => {
      expect(formatCurrency(10.005)).toBe('R$\u00A010,01');
      expect(formatCurrency(10.004)).toBe('R$\u00A010,00');
    });
  });

  describe('formatNumber', () => {
    it('formata números no padrão pt-BR', () => {
      expect(formatNumber(12.5)).toBe('12,5');
      expect(formatNumber(3)).toBe('3');
      expect(formatNumber(1234567.89)).toBe('1.234.567,89');
    });

    it('limita a 2 casas decimais', () => {
      expect(formatNumber(1.239)).toBe('1,24');
    });

    it('retorna "—" para null/undefined/NaN', () => {
      expect(formatNumber(null)).toBe('—');
      expect(formatNumber(undefined)).toBe('—');
      expect(formatNumber(Number.NaN)).toBe('—');
    });
  });

  describe('formatQuoteCode', () => {
    it('formata como ORC + 5 dígitos', () => {
      expect(formatQuoteCode(125)).toBe('ORC-00125');
      expect(formatQuoteCode(3)).toBe('ORC-00003');
      expect(formatQuoteCode(0)).toBe('ORC-00000');
    });

    it('preserva dígitos além de 5', () => {
      expect(formatQuoteCode(123456)).toBe('ORC-123456');
    });
  });
});
