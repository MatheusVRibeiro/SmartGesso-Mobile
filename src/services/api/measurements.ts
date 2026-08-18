import { getApiClient } from './client';
import type {
  Measurement,
  MeasurementListResponse,
  CreateMeasurementInput,
  UpdateMeasurementInput,
} from '../../types/measurement';

function api() {
  return getApiClient();
}

/** Módulo tipado de medições (Fase 3). */
export const measurementsService = {
  /** GET /works/:workId/measurements */
  async listByWork(workId: string): Promise<MeasurementListResponse> {
    const response = await api().get<MeasurementListResponse>(`/works/${workId}/measurements`);
    return response.data;
  },

  /** POST /works/:workId/measurements */
  async create(workId: string, data: CreateMeasurementInput): Promise<Measurement> {
    const response = await api().post<Measurement>(`/works/${workId}/measurements`, data);
    return response.data;
  },

  /** GET /measurements/:id */
  async getById(id: string): Promise<Measurement> {
    const response = await api().get<Measurement>(`/measurements/${id}`);
    return response.data;
  },

  /** PATCH /measurements/:id */
  async update(id: string, data: UpdateMeasurementInput): Promise<Measurement> {
    const response = await api().patch<Measurement>(`/measurements/${id}`, data);
    return response.data;
  },

  /** DELETE /measurements/:id (soft delete) */
  async remove(id: string): Promise<void> {
    await api().delete(`/measurements/${id}`);
  },
};