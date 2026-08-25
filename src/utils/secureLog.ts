/**
 * Utilitário de log seguro.
 *
 * NUNCA despejar objetos de erro inteiros no console: erros do Axios
 * carregam `config.headers.Authorization` (Bearer token) e `ApiError`
 * carrega `details` com o corpo da resposta. Para logs de diagnóstico,
 * extraia apenas a mensagem com `safeErrorMessage()`.
 */
export function safeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object') {
    const candidate = (error as { message?: unknown }).message;
    if (typeof candidate === 'string') {
      return candidate;
    }
    // Não cair em JSON.stringify do objeto inteiro — pode conter
    // headers/tokens/payloads sensíveis.
    return 'Erro desconhecido';
  }
  return String(error);
}
