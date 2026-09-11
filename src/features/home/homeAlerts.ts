import type { QuoteSummary } from '@/src/types/quote';

/**
 * Status finais de um orçamento — não devem aparecer como "a vencer".
 */
const FINAL_QUOTE_STATUSES = new Set(['APROVADO', 'REJEITADO', 'CANCELADO']);

/**
 * Filtra orçamentos que vencem dentro da janela [now, now + windowDays].
 *
 * Regras (extraídas de src/screens/Tabs/Home/index.tsx):
 * - Exclui status finais: APROVADO / REJEITADO / CANCELADO;
 * - Exige validUntil presente e parseável como data válida;
 * - validUntil dentro do intervalo [now, now + windowDays] (inclusive).
 *
 * Helper 100% puro — não depende de react-native nem de Date.now().
 */
export function computeExpiringQuotes(
  quotes: QuoteSummary[],
  now: Date,
  windowDays = 7,
): QuoteSummary[] {
  if (!Array.isArray(quotes)) return [];

  const inWindowDays = new Date(now);
  inWindowDays.setDate(inWindowDays.getDate() + windowDays);

  return quotes.filter((q) => {
    if (!q || !q.validUntil) return false;
    if (FINAL_QUOTE_STATUSES.has(q.status)) return false;
    const validDate = new Date(q.validUntil);
    return (
      !isNaN(validDate.getTime()) && validDate >= now && validDate <= inWindowDays
    );
  });
}

export interface OverdueReceiveSummary {
  toReceive: {
    overdue: number;
    overdueCount: number;
  };
}

export interface OverdueReceiveResult {
  hasOverdue: boolean;
  amount: number;
  count: number;
}

/**
 * Normaliza o bloco de recebimentos em atraso do overview.
 *
 * hasOverdue é true se houver valor OU contagem em atraso
 * (cobre o caso de count > 0 com amount 0).
 *
 * Helper 100% puro.
 */
export function computeOverdueReceive(
  summary: OverdueReceiveSummary,
): OverdueReceiveResult {
  const toReceive = summary?.toReceive;
  const amount = toReceive?.overdue ?? 0;
  const count = toReceive?.overdueCount ?? 0;

  return {
    hasOverdue: amount > 0 || count > 0,
    amount,
    count,
  };
}
