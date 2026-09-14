/**
 * Serviço de busca e autocompletion de CEP.
 * Utiliza ViaCEP com fallback resiliente para BrasilAPI.
 */

export interface CepAddress {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  complement?: string;
}

interface ViaCepSuccessResponse {
  cep: string;
  logradouro: string;
  complemento?: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: never;
}

interface ViaCepErrorResponse {
  erro: true | 'true';
}

type ViaCepResponse = ViaCepSuccessResponse | ViaCepErrorResponse;

interface BrasilApiSuccessResponse {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  service?: string;
}

/**
 * Remove caracteres não numéricos de uma string de CEP.
 */
export function sanitizeCep(cep: string): string {
  return (cep || '').replace(/\D/g, '');
}

/**
 * Valida se a string representa um CEP válido de 8 dígitos numéricos.
 */
export function isValidCep(cep: string): boolean {
  const sanitized = sanitizeCep(cep);
  return sanitized.length === 8 && !/^(\d)\1{7}$/.test(sanitized);
}

/**
 * Consulta CEP na API do ViaCEP com timeout configurável.
 */
async function fetchViaCep(cleanCep: string, timeoutMs = 4000): Promise<CepAddress | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as ViaCepResponse;

    if ('erro' in data && Boolean(data.erro)) {
      return null;
    }

    const successData = data as ViaCepSuccessResponse;

    return {
      cep: successData.cep || cleanCep,
      street: successData.logradouro || '',
      neighborhood: successData.bairro || '',
      city: successData.localidade || '',
      state: successData.uf || '',
      complement: successData.complemento || '',
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Consulta CEP na BrasilAPI como fallback com timeout configurável.
 */
async function fetchBrasilApi(cleanCep: string, timeoutMs = 4000): Promise<CepAddress | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCep}`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as BrasilApiSuccessResponse;

    return {
      cep: data.cep || cleanCep,
      street: data.street || '',
      neighborhood: data.neighborhood || '',
      city: data.city || '',
      state: data.state || '',
      complement: '',
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Busca os dados de endereço correspondentes a um CEP.
 * Tenta primariamente o ViaCEP; caso falhe por erro de rede ou timeout, tenta a BrasilAPI.
 *
 * @param rawCep CEP com ou sem formatação (ex.: '01310-100' ou '01310100')
 * @returns CepAddress se encontrado, ou null se inválido/não encontrado.
 */
export async function fetchAddressByCep(rawCep: string): Promise<CepAddress | null> {
  const cleanCep = sanitizeCep(rawCep);

  if (cleanCep.length !== 8) {
    return null;
  }

  try {
    const viaCepResult = await fetchViaCep(cleanCep);
    if (viaCepResult) {
      return viaCepResult;
    }
  } catch {
    // Erro de rede ou abort no ViaCEP — prossegue para o fallback
  }

  try {
    const brasilApiResult = await fetchBrasilApi(cleanCep);
    if (brasilApiResult) {
      return brasilApiResult;
    }
  } catch {
    // Falha em ambas as fontes
  }

  return null;
}

export const cepService = {
  fetchAddress: fetchAddressByCep,
  sanitizeCep,
  isValidCep,
};
