/**
 * SmartGesso Mobile — Utilitários de formatação.
 */

const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
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