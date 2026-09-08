import { AxiosError, AxiosHeaders, AxiosResponse } from 'axios';
import { toApiError } from '../client';

/**
 * Suíte do error mapper (V5 ETAPA 14).
 * toApiError vive em src/services/api/client.ts e mapeia erros axios
 * para { message, code, status?, errors?, details? }.
 */

/** Helper: constrói um objeto que passa em axios.isAxiosError (instanceof AxiosError). */
function makeAxiosError(params: {
  message?: string;
  code?: string;
  status?: number;
  data?: unknown;
}): AxiosError {
  const { message, code, status, data } = params;
  const config = {
    headers: new AxiosHeaders(),
  } as never;

  const error = new AxiosError(message, code, config, {});

  if (status !== undefined) {
    const response: Partial<AxiosResponse> = {
      status,
      statusText: 'Error',
      headers: {},
      config,
      data,
    };
    error.response = response as AxiosResponse;
  }

  return error;
}

describe('toApiError (error mapper)', () => {
  it('erro axios com response.data.code e message mapeia code+message do backend', () => {
    const error = makeAxiosError({
      message: 'Request failed with status code 403',
      code: 'ERR_BAD_REQUEST',
      status: 403,
      data: {
        code: 'COMPANY_ACCESS_DENIED',
        message: 'Você não tem acesso a esta empresa',
      },
    });

    const mapped = toApiError(error);

    // code conhecido do backend tem prioridade sobre o mapeamento por status
    expect(mapped.code).toBe('COMPANY_ACCESS_DENIED');
    expect(mapped.message).toBe('Você não tem acesso a esta empresa');
    expect(mapped.status).toBe(403);
  });

  it('erro axios com response mapeia por status HTTP (422 → VALIDATION_ERROR) e propaga errors de campo', () => {
    const error = makeAxiosError({
      message: 'Request failed with status code 422',
      status: 422,
      data: {
        message: 'Dados inválidos',
        errors: { email: ['E-mail inválido'] },
      },
    });

    const mapped = toApiError(error);

    expect(mapped.code).toBe('VALIDATION_ERROR');
    expect(mapped.message).toBe('Dados inválidos');
    expect(mapped.errors).toEqual({ email: ['E-mail inválido'] });
    expect(mapped.status).toBe(422);
  });

  it('erro axios com response sem body usa error.message do axios', () => {
    const error = makeAxiosError({
      message: 'Request failed with status code 500',
      status: 500,
      data: undefined,
    });

    const mapped = toApiError(error);

    expect(mapped.code).toBe('SERVER_ERROR');
    expect(mapped.message).toBe('Request failed with status code 500');
    expect(mapped.status).toBe(500);
  });

  it('erro sem response (sem status) retorna mensagem genérica e NETWORK_ERROR', () => {
    // AxiosError construído sem response — cobre falhas sem resposta HTTP
    const error = makeAxiosError({
      message: 'Request failed with status code undefined',
      code: 'ERR_BAD_REQUEST',
    });

    const mapped = toApiError(error);

    expect(mapped.code).toBe('NETWORK_ERROR');
    expect(mapped.message).toBe('Erro de rede — verifique sua conexão');
    expect(mapped.status).toBeUndefined();
  });

  it('erro network ECONNABORTED retorna mensagem de timeout', () => {
    const error = makeAxiosError({
      message: 'timeout of 15000ms exceeded',
      code: 'ECONNABORTED',
    });

    const mapped = toApiError(error);

    expect(mapped.code).toBe('NETWORK_ERROR');
    expect(mapped.message).toBe('Tempo limite de conexão excedido');
  });

  it('erro network (ERR_NETWORK, sem response) retorna mensagem offline-friendly', () => {
    const error = makeAxiosError({
      message: 'Network Error',
      code: 'ERR_NETWORK',
    });

    const mapped = toApiError(error);

    expect(mapped.code).toBe('NETWORK_ERROR');
    expect(mapped.message).toBe('Erro de rede — verifique sua conexão');
  });

  it('erro não-axios (unknown, string, object) retorna mensagem genérica', () => {
    expect(toApiError('boom')).toEqual({
      message: 'Erro de rede — verifique sua conexão',
      code: 'NETWORK_ERROR',
    });

    expect(toApiError(new Error('falha inesperada'))).toEqual({
      message: 'Erro de rede — verifique sua conexão',
      code: 'NETWORK_ERROR',
    });

    expect(toApiError(undefined)).toEqual({
      message: 'Erro de rede — verifique sua conexão',
      code: 'NETWORK_ERROR',
    });
  });
});
