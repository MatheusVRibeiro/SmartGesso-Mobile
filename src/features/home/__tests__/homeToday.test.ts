// ─── Testes unitários puros — homeToday (V4 ETAPA 15) ───────────────────────

import {
  buildTodayTimeline,
  computeInProgressServices,
  computeOverdueServices,
  isServiceOverdue,
  type OperationalTodayInput,
  type ServiceOrderSummary,
} from '../homeToday';

// now fixo: 2026-09-10 (quinta), 14:30 local
const NOW = new Date(2026, 8, 10, 14, 30, 0);

const iso = (y: number, m: number, d: number, h = 9, min = 0) =>
  new Date(y, m, d, h, min).toISOString();

function so(
  overrides: Partial<ServiceOrderSummary> & { id: string },
): ServiceOrderSummary {
  return {
    code: 1,
    status: 'PENDENTE',
    scheduledDate: null,
    ...overrides,
  };
}

describe('isServiceOverdue', () => {
  it('retorna true para OS PENDENTE agendada ontem', () => {
    expect(
      isServiceOverdue({ status: 'PENDENTE', scheduledDate: iso(2026, 8, 9, 8) }, NOW),
    ).toBe(true);
  });

  it('retorna true para OS EM_DESLOCAMENTO agendada ontem (análogo a AGENDADA)', () => {
    expect(
      isServiceOverdue(
        { status: 'EM_DESLOCAMENTO', scheduledDate: iso(2026, 8, 9, 23) },
        NOW,
      ),
    ).toBe(true);
  });

  it('retorna false para OS EM_ANDAMENTO agendada hoje', () => {
    expect(
      isServiceOverdue(
        { status: 'EM_ANDAMENTO', scheduledDate: iso(2026, 8, 10, 8) },
        NOW,
      ),
    ).toBe(false);
  });

  it('retorna false para OS CONCLUIDA agendada ontem', () => {
    expect(
      isServiceOverdue(
        { status: 'CONCLUIDA', scheduledDate: iso(2026, 8, 9, 8) },
        NOW,
      ),
    ).toBe(false);
  });

  it('retorna false para scheduledDate null', () => {
    expect(isServiceOverdue({ status: 'PENDENTE', scheduledDate: null }, NOW)).toBe(
      false,
    );
  });

  it('retorna false para CANCELADA agendada ontem', () => {
    expect(
      isServiceOverdue(
        { status: 'CANCELADA', scheduledDate: iso(2026, 8, 9, 8) },
        NOW,
      ),
    ).toBe(false);
  });
});

describe('computeOverdueServices', () => {
  it('filtra apenas as OS atrasadas', () => {
    const services: ServiceOrderSummary[] = [
      so({ id: 'a', status: 'PENDENTE', scheduledDate: iso(2026, 8, 9) }),
      so({ id: 'b', status: 'PENDENTE', scheduledDate: iso(2026, 8, 10) }),
      so({ id: 'c', status: 'CONCLUIDA', scheduledDate: iso(2026, 8, 9) }),
      so({ id: 'd', status: 'EM_ANDAMENTO', scheduledDate: iso(2026, 8, 1) }),
    ];
    const result = computeOverdueServices(services, NOW);
    expect(result.map((s) => s.id)).toEqual(['a', 'd']);
  });

  it('retorna [] quando nenhuma está atrasada', () => {
    expect(computeOverdueServices([], NOW)).toEqual([]);
  });
});

describe('computeInProgressServices', () => {
  it('retorna apenas OS com status EM_ANDAMENTO, independente de data', () => {
    const services: ServiceOrderSummary[] = [
      so({ id: 'a', status: 'EM_ANDAMENTO', scheduledDate: iso(2026, 8, 10) }),
      so({ id: 'b', status: 'PENDENTE', scheduledDate: iso(2026, 8, 10) }),
      so({ id: 'c', status: 'EM_ANDAMENTO', scheduledDate: iso(2026, 8, 1) }),
      so({ id: 'd', status: 'CONCLUIDA', scheduledDate: null }),
    ];
    const result = computeInProgressServices(services, NOW);
    expect(result.map((s) => s.id)).toEqual(['a', 'c']);
  });

  it('retorna [] quando não há EM_ANDAMENTO', () => {
    expect(computeInProgressServices([], NOW)).toEqual([]);
  });
});

describe('buildTodayTimeline', () => {
  const input: OperationalTodayInput = {
    visits: [
      {
        id: 'v1',
        type: 'MEDICAO',
        title: null,
        time: iso(2026, 8, 10, 15),
        client: { name: 'Cliente X' },
        notes: 'Levar trena',
      },
      {
        id: 'v2',
        type: 'MEDICAO',
        title: null,
        time: iso(2026, 8, 10, 9),
        client: { name: 'Cliente Cedo' },
        notes: null,
      },
    ],
    services: [
      so({
        id: 's1',
        code: 123,
        status: 'PENDENTE',
        scheduledDate: iso(2026, 8, 10, 12),
        client: { name: 'Cliente Y' },
        work: { name: 'Instalação drywall' },
      }),
    ],
    followUps: [
      {
        id: 'f1',
        quoteId: 'q1',
        quoteNumber: 7,
        type: 'WHATSAPP',
        notes: 'Retomar proposta',
        scheduledAt: null,
        client: { name: 'Cliente Z' },
      },
    ],
  };

  it('retorna [] para timeline vazia', () => {
    expect(
      buildTodayTimeline({ services: [], visits: [], followUps: [] }, NOW),
    ).toEqual([]);
  });

  it('ordena por hora crescente com time null no fim', () => {
    const timeline = buildTodayTimeline(input, NOW);
    expect(timeline.map((t) => t.id)).toEqual(['v2', 's1', 'v1', 'f1']);
    // time null é o último
    expect(timeline[3].time).toBeNull();
  });

  it('gera rotas corretas por kind', () => {
    const timeline = buildTodayTimeline(input, NOW);
    const byId = new Map(timeline.map((t) => [t.id, t]));
    expect(byId.get('v1')?.route).toBe('/(app)/agenda');
    expect(byId.get('s1')?.route).toBe('/(app)/servicos/s1');
    expect(byId.get('f1')?.route).toBe('/(app)/orcamentos/q1');
  });

  it('gera títulos no formato esperado', () => {
    const timeline = buildTodayTimeline(input, NOW);
    const byId = new Map(timeline.map((t) => [t.id, t]));
    expect(byId.get('v1')?.title).toBe('MEDICAO — Cliente X');
    expect(byId.get('s1')?.title).toBe('OS #123 — Cliente Y');
    expect(byId.get('f1')?.title).toBe('Follow-up — Cliente Z');
  });

  it('usa title da visita quando presente e notes como subtitle', () => {
    const timeline = buildTodayTimeline(
      {
        visits: [
          {
            id: 'v9',
            type: 'VISITA',
            title: 'Reunião de alinhamento',
            time: iso(2026, 8, 10, 10),
            client: { name: 'Cliente W' },
            notes: 'Confirmar medidas',
          },
        ],
      },
      NOW,
    );
    expect(timeline[0].title).toBe('Reunião de alinhamento — Cliente W');
    expect(timeline[0].subtitle).toBe('Confirmar medidas');
    expect(timeline[0].kind).toBe('visit');
  });
});
