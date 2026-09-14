/**
 * Serviço de busca e autocompletion de dados cadastrais por CNPJ.
 * Utiliza BrasilAPI com fallback resiliente para MinhaReceita.
 */

export interface CnpjCompanyData {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  telefone?: string;
  email?: string;
}

interface BrasilApiCnpjResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  ddd_telefone_1?: string;
  email?: string;
}

interface MinhaReceitaCnpjResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  ddd_telefone_1?: string;
  email?: string;
}

export function sanitizeCnpj(cnpj: string): string {
  return (cnpj || '').replace(/\D/g, '');
}

export function isValidCnpj(cnpj: string): boolean {
  const sanitized = sanitizeCnpj(cnpj);
  return sanitized.length === 14 && !/^(\d)\1{13}$/.test(sanitized);
}

async function fetchBrasilApi(cleanCnpj: string, timeoutMs = 5000): Promise<CnpjCompanyData | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'SmartGesso-Mobile/1.0',
        Accept: 'application/json',
      },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as BrasilApiCnpjResponse;
    if (!data.razao_social) return null;

    return {
      cnpj: data.cnpj || cleanCnpj,
      razaoSocial: data.razao_social || '',
      nomeFantasia: data.nome_fantasia || '',
      cep: data.cep || '',
      logradouro: data.logradouro || '',
      numero: data.numero || '',
      complemento: data.complemento || '',
      bairro: data.bairro || '',
      municipio: data.municipio || '',
      uf: data.uf || '',
      telefone: data.ddd_telefone_1 || '',
      email: data.email || '',
    };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchMinhaReceita(cleanCnpj: string, timeoutMs = 5000): Promise<CnpjCompanyData | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`https://minhareceita.org/${cleanCnpj}`, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as MinhaReceitaCnpjResponse;
    if (!data.razao_social) return null;

    return {
      cnpj: data.cnpj || cleanCnpj,
      razaoSocial: data.razao_social || '',
      nomeFantasia: data.nome_fantasia || '',
      cep: data.cep || '',
      logradouro: data.logradouro || '',
      numero: data.numero || '',
      complemento: data.complemento || '',
      bairro: data.bairro || '',
      municipio: data.municipio || '',
      uf: data.uf || '',
      telefone: data.ddd_telefone_1 || '',
      email: data.email || '',
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchCompanyByCnpj(rawCnpj: string): Promise<CnpjCompanyData | null> {
  const cleanCnpj = sanitizeCnpj(rawCnpj);

  if (cleanCnpj.length !== 14) {
    return null;
  }

  try {
    const result = await fetchBrasilApi(cleanCnpj);
    if (result) return result;
  } catch {
    // Fallback para MinhaReceita
  }

  try {
    const result = await fetchMinhaReceita(cleanCnpj);
    if (result) return result;
  } catch {
    // Falha em ambas as fontes
  }

  return null;
}

export const cnpjService = {
  fetchCompany: fetchCompanyByCnpj,
  sanitizeCnpj,
  isValidCnpj,
};
