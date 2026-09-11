/**
 * SmartGesso Mobile — Utilitários de formatação.
 */

const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const numberFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 2,
});

/**
 * Formata um valor numérico como moeda brasileira (BRL).
 * Ex.: 12.5 → "R$ 12,50" · null/undefined/NaN → "—"
 */
export function formatCurrency(value?: number | null): string {
  if (value == null || Number.isNaN(value)) {
    return '—';
  }
  return brlFormatter.format(value);
}

/**
 * Formata um número com até 2 casas decimais no padrão pt-BR.
 * Ex.: 12.5 → "12,5" · 3 → "3" · null/undefined/NaN → "—"
 */
export function formatNumber(value?: number | null): string {
  if (value == null || Number.isNaN(value)) {
    return '—';
  }
  return numberFormatter.format(value);
}

/**
 * Formata o número do orçamento como código comercial (#NNN).
 * Ex.: 7 → "#007" · 125 → "#125" · 1234 → "#1234"
 */
export function formatQuoteCode(quoteNumber: number): string {
  return `#${String(quoteNumber).padStart(3, '0')}`;
}