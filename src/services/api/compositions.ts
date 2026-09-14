import { getApiClient } from './client';
import type {
  Composition,
  CalculateMaterialsInput,
  CalculateMaterialsResponse,
  CalculatedMaterialItem,
} from '../../types/composition';

function api() {
  return getApiClient();
}

/**
 * Cálculo local de composição de materiais como fallback
 * quando o backend retorna 404 (rota não implementada) ou em modo offline.
 */
export function calculateLocalMaterials(
  data: CalculateMaterialsInput
): CalculateMaterialsResponse {
  const totalArea = data.measurements.reduce((acc, m) => {
    const area = m.area ?? (m.length && m.width ? m.length * m.width : 0);
    return acc + area;
  }, 0);

  const totalPerimeter = data.measurements.reduce((acc, m) => {
    const perim =
      m.perimeter ??
      (m.length && m.width ? 2 * (m.length + m.width) : 0);
    return acc + perim;
  }, 0);

  const effectiveArea = totalArea > 0 ? totalArea : 10;
  const effectivePerimeter = totalPerimeter > 0 ? totalPerimeter : Math.sqrt(effectiveArea) * 4;

  const items: CalculatedMaterialItem[] = [];

  const appType = data.applicationType || 'DRYWALL';

  if (appType.includes('DRYWALL') || appType.includes('FORRO')) {
    const placasQty = Math.ceil((effectiveArea / 2.16) * 1.05); // +5% quebra
    const perfilF530 = Math.ceil(effectiveArea * 1.8); // metros
    const canaletaU = Math.ceil(effectivePerimeter * 1.1); // metros
    const parafusoGesso = Math.ceil(effectiveArea * 25); // un
    const fitaTratamento = Math.ceil(effectiveArea * 1.5); // metros
    const massaJunta = Math.round(effectiveArea * 0.9 * 10) / 10; // kg

    items.push(
      {
        materialType: 'PLACA',
        name: 'Placa Drywall ST 12.5mm (1.20 x 1.80m)',
        unit: 'un',
        quantity: placasQty,
        unitPrice: 38.5,
        total: Math.round(placasQty * 38.5 * 100) / 100,
      },
      {
        materialType: 'PERFIL',
        name: 'Perfil F530 (Canaleta metálica)',
        unit: 'm',
        quantity: perfilF530,
        unitPrice: 8.5,
        total: Math.round(perfilF530 * 8.5 * 100) / 100,
      },
      {
        materialType: 'GUIA',
        name: 'Guia / Cantoneira U 25x30',
        unit: 'm',
        quantity: canaletaU,
        unitPrice: 6.2,
        total: Math.round(canaletaU * 6.2 * 100) / 100,
      },
      {
        materialType: 'FIXACAO',
        name: 'Parafuso GN25 Drywall',
        unit: 'un',
        quantity: parafusoGesso,
        unitPrice: 0.15,
        total: Math.round(parafusoGesso * 0.15 * 100) / 100,
      },
      {
        materialType: 'ACABAMENTO',
        name: 'Fita de Papel Microperfurada',
        unit: 'm',
        quantity: fitaTratamento,
        unitPrice: 0.8,
        total: Math.round(fitaTratamento * 0.8 * 100) / 100,
      },
      {
        materialType: 'ACABAMENTO',
        name: 'Massa para Junta Drywall (Kg)',
        unit: 'kg',
        quantity: massaJunta,
        unitPrice: 5.5,
        total: Math.round(massaJunta * 5.5 * 100) / 100,
      }
    );
  } else if (appType.includes('SANCA') || appType.includes('GESSO')) {
    const placasGesso = Math.ceil((effectiveArea / 0.36) * 1.05); // Placas 60x60
    const gessoCola = Math.round(effectiveArea * 1.2 * 10) / 10; // kg
    const sisal = Math.round(effectiveArea * 0.4 * 10) / 10; // kg
    const arame = Math.round(effectiveArea * 1.5 * 10) / 10; // m

    items.push(
      {
        materialType: 'PLACA',
        name: 'Placa de Gesso 60x60cm',
        unit: 'un',
        quantity: placasGesso,
        unitPrice: 7.5,
        total: Math.round(placasGesso * 7.5 * 100) / 100,
      },
      {
        materialType: 'COLA',
        name: 'Gesso Cola (Kg)',
        unit: 'kg',
        quantity: gessoCola,
        unitPrice: 3.2,
        total: Math.round(gessoCola * 3.2 * 100) / 100,
      },
      {
        materialType: 'FIXACAO',
        name: 'Sisal / Fibra',
        unit: 'kg',
        quantity: sisal,
        unitPrice: 18.0,
        total: Math.round(sisal * 18.0 * 100) / 100,
      },
      {
        materialType: 'FIXACAO',
        name: 'Arame Galvanizado nº 18',
        unit: 'm',
        quantity: arame,
        unitPrice: 0.9,
        total: Math.round(arame * 0.9 * 100) / 100,
      }
    );
  } else {
    const areaQty = Math.max(1, Math.ceil(effectiveArea));
    items.push({
      materialType: 'MATERIAL',
      name: `Material para ${appType}`,
      unit: 'm²',
      quantity: areaQty,
      unitPrice: 30.0,
      total: Math.round(areaQty * 30.0 * 100) / 100,
    });
  }

  const estimatedCost = items.reduce((sum, item) => sum + (item.total ?? 0), 0);

  return {
    composition: {
      code: `COMP-${appType}`,
      name: `Composição ${appType}`,
      version: 1,
    },
    items,
    totalArea: Math.round(effectiveArea * 100) / 100,
    estimatedCost: Math.round(estimatedCost * 100) / 100,
  };
}

/** Módulo tipado de composições e cálculo de materiais (Fase 3). */
export const compositionsService = {
  /** GET /compositions */
  async list(): Promise<Composition[]> {
    try {
      const response = await api().get<Composition[]>('/compositions');
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  /** POST /compositions/calculate */
  async calculate(
    data: CalculateMaterialsInput
  ): Promise<CalculateMaterialsResponse> {
    try {
      const response = await api().post<CalculateMaterialsResponse>(
        '/compositions/calculate',
        data
      );
      return response.data;
    } catch (error: any) {
      // Se o endpoint não existir na API (404), usa cálculo de composição local automático
      if (error?.response?.status === 404 || error?.code === 'ERR_NETWORK') {
        return calculateLocalMaterials(data);
      }
      throw error;
    }
  },
};