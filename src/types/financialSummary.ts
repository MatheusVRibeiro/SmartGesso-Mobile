// ─── Resumo Financeiro por Serviço (Fase 6) ────────────────────────────────

/**
 * Resumo financeiro de uma ordem de serviço.
 * Calculado pela API a partir de pagamentos recebidos, despesas e orçamento.
 */
export interface FinancialSummary {
  /** Valor contratado original (do orçamento aprovado). */
  contractedValue: number;
  /** Adicionais aprovados após a contratação (revisões/adições). */
  additionalApproved: number;
  /** Valor contratado total (contractedValue + additionalApproved). */
  totalContracted: number;
  /** Valor total recebido até o momento. */
  received: number;
  /** Valor ainda a receber (totalContracted - received). */
  toReceive: number;
  /** Custo previsto (forecast) para execução do serviço. */
  forecastCost: number;
  /** Custo realizado (realized) até o momento. */
  realizedCost: number;
  /** Resultado projetado (totalContracted - forecastCost). */
  projectedResult: number;
  /** Resultado de caixa (totalContracted - realizedCost). */
  cashResult: number;
  /** Margem atual (cashResult / totalContracted), em percentual (0-100). */
  margin: number;
}
