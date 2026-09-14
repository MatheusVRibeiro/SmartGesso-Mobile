/**
 * Utilitários para formatação e manipulação de datas no padrão brasileiro (DD/MM/AAAA)
 * e compatibilidade com datas ISO (AAAA-MM-DD).
 */

export const MONTH_NAMES_PT_BR = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
] as const;

export const WEEKDAY_SHORT_PT_BR = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;

/**
 * Converte um objeto Date para string no formato ISO local "AAAA-MM-DD"
 * sem desvio de timezone.
 */
export function toIsoDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converte data ISO ("AAAA-MM-DD" ou com timestamp) para string formatada brasileira "DD/MM/AAAA".
 */
export function formatDateBr(dateInput?: string | Date | null): string {
  if (!dateInput) return '';

  if (dateInput instanceof Date) {
    if (Number.isNaN(dateInput.getTime())) return '';
    const day = String(dateInput.getDate()).padStart(2, '0');
    const month = String(dateInput.getMonth() + 1).padStart(2, '0');
    const year = dateInput.getFullYear();
    return `${day}/${month}/${year}`;
  }

  const trimmed = dateInput.trim();
  if (!trimmed) return '';

  // Se já estiver em DD/MM/AAAA
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    return trimmed;
  }

  // Se estiver em AAAA-MM-DD
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return `${d}/${m}/${y}`;
  }

  // Fallback para Date parser
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    const day = String(parsed.getUTCDate()).padStart(2, '0');
    const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
    const year = parsed.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }

  return trimmed;
}

/**
 * Converte data brasileira "DD/MM/AAAA" para formato ISO "AAAA-MM-DD".
 * Se já for ISO, apenas retorna a data no formato AAAA-MM-DD.
 */
export function parseDateBrToIso(brDate?: string | null): string | null {
  if (!brDate) return null;
  const trimmed = brDate.trim();
  if (!trimmed) return null;

  // Se já estiver em AAAA-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const brMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
  if (brMatch) {
    const [, d, m, y] = brMatch;
    const day = parseInt(d, 10);
    const month = parseInt(m, 10);
    const year = parseInt(y, 10);

    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }

    return `${y}-${m}-${d}`;
  }

  return null;
}

/**
 * Valida se uma string é uma data válida no formato brasileiro DD/MM/AAAA.
 */
export function isValidBrDate(dateStr?: string | null): boolean {
  if (!dateStr) return false;
  const iso = parseDateBrToIso(dateStr);
  if (!iso) return false;
  return isValidIsoDate(iso);
}

/**
 * Valida se uma string é uma data válida no formato ISO AAAA-MM-DD.
 */
export function isValidIsoDate(dateStr?: string | null): boolean {
  if (!dateStr) return false;
  const trimmed = dateStr.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) return false;
  const [, y, m, d] = match;
  const year = parseInt(y, 10);
  const month = parseInt(m, 10) - 1;
  const day = parseInt(d, 10);

  const date = new Date(year, month, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day
  );
}

/**
 * Retorna o número de dias em um determinado mês/ano.
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Retorna o dia da semana do primeiro dia do mês (0 = Domingo, 1 = Segunda, ...).
 */
export function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}
