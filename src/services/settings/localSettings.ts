import AsyncStorage from '@react-native-async-storage/async-storage';
import type { QuotePaymentMethod } from '../../types/quote';

/**
 * Configurações locais do SmartGesso Mobile.
 *
 * A SmartGesso-API NÃO expõe endpoints de settings da empresa (apenas
 * GET /auth/companies e POST /auth/switch-company — ver auth.service.ts).
 * Enquanto isso, as configurações de empresa e orçamento são persistidas
 * LOCALMENTE no dispositivo via AsyncStorage, chaveadas por empresa.
 *
 * ⚠️ As telas de Configurações exibem um aviso de que os dados são salvos
 * apenas neste dispositivo até a API expor um endpoint de settings.
 */

export interface CompanyAddressSettings {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface CompanySettings {
  tradeName: string;
  document: string;
  phone: string;
  email: string;
  address: CompanyAddressSettings;
}

export interface QuoteSettings {
  /** Prefixo da numeração de orçamentos (ex.: ORC-0001). */
  numberingPrefix: string;
  /** Perda padrão de material em % aplicada nos orçamentos. */
  defaultLossPct: number;
  /** Garantia padrão em dias. */
  warrantyDays: number;
  /** Formas de pagamento aceitas (multi-select). */
  paymentMethods: QuotePaymentMethod[];
}

export interface AppSettings {
  company: CompanySettings;
  quote: QuoteSettings;
}

const STORAGE_PREFIX = '@smartgesso/settings';

function storageKey(companyId: string): string {
  return `${STORAGE_PREFIX}/${companyId}`;
}

export const DEFAULT_QUOTE_SETTINGS: QuoteSettings = {
  numberingPrefix: 'ORC',
  defaultLossPct: 10,
  warrantyDays: 90,
  paymentMethods: ['AVISTA', 'AVISTA_DESCONTO', 'ENTRADA_SALDO', 'MENSAL', 'PARCELADO'],
};

/** Cria o estado padrão, pré-preenchido com os dados vindos da API (quando houver). */
export function createDefaultSettings(
  company?: { tradeName?: string; document?: string } | null
): AppSettings {
  return {
    company: {
      tradeName: company?.tradeName ?? '',
      document: company?.document ?? '',
      phone: '',
      email: '',
      address: {
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
      },
    },
    quote: { ...DEFAULT_QUOTE_SETTINGS },
  };
}

export const settingsService = {
  /** Lê as configurações locais da empresa. Retorna null se nunca foram salvas. */
  async get(companyId: string): Promise<AppSettings | null> {
    try {
      const raw = await AsyncStorage.getItem(storageKey(companyId));
      if (!raw) return null;
      return JSON.parse(raw) as AppSettings;
    } catch {
      return null;
    }
  },

  /** Persiste as configurações localmente (apenas neste dispositivo). */
  async save(companyId: string, settings: AppSettings): Promise<void> {
    await AsyncStorage.setItem(storageKey(companyId), JSON.stringify(settings));
  },
};