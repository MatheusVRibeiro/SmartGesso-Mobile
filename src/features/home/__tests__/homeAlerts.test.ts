import { computeExpiringQuotes, computeOverdueReceive } from '../homeAlerts';
import type { QuoteSummary } from '@/src/types/quote';

// Data fixa para testes determinísticos: 2026-09-10T12:00:00 (local)
const NOW = new Date(2026, 8, 10, 12, 0, 0);

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function makeQuote(overrides: Partial<QuoteSummary> = {}): QuoteSummary {
  return {
    id: 'q1',
    quoteNumber: 1,
    version: 1,
    status: 'RASCUNHO',
    total: 1000,
    paymentMethod: 'PIX',
    createdAt: '2026-09-01T10:00:00.000Z',
    validUntil: addDays(NOW, 3).toISOString(),
    ...overrides,
  } as QuoteSummary;
}

describe('computeExpiringQuotes', () => {
  it('inclui orçamento que vence em 3 dias', () => {
    const quotes = [makeQuote({ id: 'a', validUntil: addDays(NOW, 3).toISOString() })];
    const result = computeExpiringQuotes(quotes, NOW);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('a');
  });

  it('inclui orçamento que vence hoje (limite inferior)', () => {
    const quotes = [makeQuote({ id: 'b', validUntil: NOW.toISOString() })];
    expect(computeExpiringQuotes(quotes, NOW)).toHaveLength(1);
  });

  it('exclui orçamento que venceu ontem', () => {
    const quotes = [makeQuote({ id: 'c', validUntil: addDays(NOW, -1).toISOString() })];
    expect(computeExpiringQuotes(quotes, NOW)).toHaveLength(0);
  });

  it('exclui orçamento que vence em 8 dias (fora da janela de 7)', () => {
    const quotes = [makeQuote({ id: 'd', validUntil: addDays(NOW, 8).toISOString() })];
    expect(computeExpiringQuotes(quotes, NOW)).toHaveLength(0);
  });

  it('inclui orçamento que vence exatamente em 7 dias (limite superior)', () => {
    const quotes = [makeQuote({ id: 'e', validUntil: addDays(NOW, 7).toISOString() })];
    expect(computeExpiringQuotes(quotes, NOW)).toHaveLength(1);
  });

  it.each(['APROVADO', 'REJEITADO', 'CANCELADO'] as const)(
    'exclui orçamento com status final %s',
    (status) => {
      const quotes = [makeQuote({ status })];
      expect(computeExpiringQuotes(quotes, NOW)).toHaveLength(0);
    },
  );

  it('exclui orçamento com validUntil null', () => {
    const quotes = [makeQuote({ validUntil: null })];
    expect(computeExpiringQuotes(quotes, NOW)).toHaveLength(0);
  });

  it('exclui orçamento com validUntil undefined', () => {
    const quotes = [makeQuote({ validUntil: undefined })];
    expect(computeExpiringQuotes(quotes, NOW)).toHaveLength(0);
  });

  it('exclui orçamento com validUntil inválida (data não parseável)', () => {
    const quotes = [makeQuote({ validUntil: 'not-a-date' })];
    expect(computeExpiringQuotes(quotes, NOW)).toHaveLength(0);
  });

  it('respeita windowDays custom (ex.: 3 dias)', () => {
    const quotes = [
      makeQuote({ id: 'w2', validUntil: addDays(NOW, 2).toISOString() }),
      makeQuote({ id: 'w5', validUntil: addDays(NOW, 5).toISOString() }),
    ];
    const result = computeExpiringQuotes(quotes, NOW, 3);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('w2');
  });

  it('respeita windowDays custom maior (ex.: 15 dias)', () => {
    const quotes = [
      makeQuote({ id: 'x8', validUntil: addDays(NOW, 8).toISOString() }),
      makeQuote({ id: 'x20', validUntil: addDays(NOW, 20).toISOString() }),
    ];
    const result = computeExpiringQuotes(quotes, NOW, 15);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('x8');
  });

  it('retorna array vazio para entrada não-array', () => {
    expect(computeExpiringQuotes(undefined as unknown as QuoteSummary[], NOW)).toEqual([]);
  });
});

describe('computeOverdueReceive', () => {
  it('hasOverdue true quando overdue > 0', () => {
    expect(
      computeOverdueReceive({ toReceive: { overdue: 1500, overdueCount: 2 } }),
    ).toEqual({ hasOverdue: true, amount: 1500, count: 2 });
  });

  it('hasOverdue false quando tudo zerado', () => {
    expect(
      computeOverdueReceive({ toReceive: { overdue: 0, overdueCount: 0 } }),
    ).toEqual({ hasOverdue: false, amount: 0, count: 0 });
  });

  it('hasOverdue true quando overdueCount > 0 mesmo com amount 0', () => {
    expect(
      computeOverdueReceive({ toReceive: { overdue: 0, overdueCount: 3 } }),
    ).toEqual({ hasOverdue: true, amount: 0, count: 3 });
  });

  it('trata toReceive ausente com defaults zerados', () => {
    expect(
      computeOverdueReceive({} as { toReceive: { overdue: number; overdueCount: number } }),
    ).toEqual({ hasOverdue: false, amount: 0, count: 0 });
  });
});
