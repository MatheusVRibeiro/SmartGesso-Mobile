// ─── Agenda (V3) ───────────────────────────────────────────────────────────

/**
 * Tipos de compromisso da Agenda (V3):
 * visita, medição, início, instalação, produção, retorno, acabamento,
 * entrega, cobrança e outro compromisso.
 */
export type AgendaItemType =
  | 'VISITA'
  | 'MEDICAO'
  | 'INICIO'
  | 'INSTALACAO'
  | 'PRODUCAO'
  | 'RETORNO'
  | 'ACABAMENTO'
  | 'ENTREGA'
  | 'COBRANCA'
  | 'OUTRO';

/** Origem do item na Agenda (fonte de dados atual da API). */
export type AgendaItemSource = 'QUOTE' | 'SERVICE_ORDER';

export interface AgendaItem {
  id: string;
  type: AgendaItemType;
  /** Título exibido no card (ex.: "Visita", "OS #123"). */
  title: string;
  clientName: string;
  /** Data do compromisso (YYYY-MM-DD, fuso local). */
  date: string;
  /** Hora do compromisso (HH:mm) ou null quando não informada. */
  time: string | null;
  source: AgendaItemSource;
  sourceId: string;
}