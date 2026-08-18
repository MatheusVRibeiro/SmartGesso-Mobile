import { getApiClient } from './client';
import type {
  Composition,
  CalculateMaterialsInput,
  CalculateMaterialsResponse,
} from '../../types/composition';

function api() {
  return getApiClient();
}

/** Módulo tipado de composições e cálculo de materiais (Fase 3). */
export const compositionsService = {
  /** GET /compositions */
  async list(): Promise<Composition[]> {
    const response = await api().get<Composition[]>('/compositions');
    return response.data;
  },

  /** POST /compositions/calculate */
  async calculate(data: CalculateMaterialsInput): Promise<CalculateMaterialsResponse> {
    const response = await api().post<CalculateMaterialsResponse>('/compositions/calculate', data);
    return response.data;
  },
};