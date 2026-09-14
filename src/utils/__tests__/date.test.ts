import {
  formatDateBr,
  parseDateBrToIso,
  isValidBrDate,
  isValidIsoDate,
  toIsoDateString,
  getDaysInMonth,
  getFirstDayOfWeek,
  MONTH_NAMES_PT_BR,
} from '../date';

describe('Date Utilities (pt-BR / ISO)', () => {
  describe('toIsoDateString', () => {
    it('deve converter um objeto Date para YYYY-MM-DD', () => {
      const date = new Date(2026, 7, 25); // Mês 7 = Agosto
      expect(toIsoDateString(date)).toBe('2026-08-25');
    });
  });

  describe('formatDateBr', () => {
    it('deve formatar data ISO AAAA-MM-DD para DD/MM/AAAA', () => {
      expect(formatDateBr('2026-08-25')).toBe('25/08/2026');
      expect(formatDateBr('2025-01-05')).toBe('05/01/2025');
    });

    it('deve manter se já estiver em DD/MM/AAAA', () => {
      expect(formatDateBr('25/08/2026')).toBe('25/08/2026');
    });

    it('deve retornar string vazia para valores nulos ou vazios', () => {
      expect(formatDateBr(null)).toBe('');
      expect(formatDateBr('')).toBe('');
      expect(formatDateBr(undefined)).toBe('');
    });
  });

  describe('parseDateBrToIso', () => {
    it('deve converter data DD/MM/AAAA para AAAA-MM-DD', () => {
      expect(parseDateBrToIso('25/08/2026')).toBe('2026-08-25');
      expect(parseDateBrToIso('01/12/2024')).toBe('2024-12-01');
    });

    it('deve retornar a própria data se já for ISO', () => {
      expect(parseDateBrToIso('2026-08-25')).toBe('2026-08-25');
    });

    it('deve retornar null para datas inválidas', () => {
      expect(parseDateBrToIso('99/99/9999')).toBeNull();
      expect(parseDateBrToIso('')).toBeNull();
      expect(parseDateBrToIso(null)).toBeNull();
    });
  });

  describe('isValidBrDate e isValidIsoDate', () => {
    it('deve validar datas brasileiras corretamente', () => {
      expect(isValidBrDate('25/08/2026')).toBe(true);
      expect(isValidBrDate('29/02/2024')).toBe(true); // bissexto
      expect(isValidBrDate('31/02/2024')).toBe(false);
      expect(isValidBrDate('invalido')).toBe(false);
    });

    it('deve validar datas ISO corretamente', () => {
      expect(isValidIsoDate('2026-08-25')).toBe(true);
      expect(isValidIsoDate('2026-02-30')).toBe(false);
      expect(isValidIsoDate('2026-13-01')).toBe(false);
    });
  });

  describe('Calendário helpers', () => {
    it('deve retornar o número correto de dias do mês', () => {
      expect(getDaysInMonth(2026, 7)).toBe(31); // Agosto (mês 7)
      expect(getDaysInMonth(2026, 1)).toBe(28); // Fevereiro 2026
      expect(getDaysInMonth(2024, 1)).toBe(29); // Fevereiro 2024 (bissexto)
    });

    it('deve conter 12 meses em português', () => {
      expect(MONTH_NAMES_PT_BR.length).toBe(12);
      expect(MONTH_NAMES_PT_BR[0]).toBe('Janeiro');
      expect(MONTH_NAMES_PT_BR[7]).toBe('Agosto');
      expect(MONTH_NAMES_PT_BR[11]).toBe('Dezembro');
    });
  });
});
