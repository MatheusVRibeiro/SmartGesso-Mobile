import { getApiClient } from './client';
import type {
  Work,
  WorkListResponse,
  CreateWorkInput,
  UpdateWorkInput,
} from '../../types/work';

function api() {
  return getApiClient();
}

/** Módulo tipado de obras (Fase 2). */
export const worksService = {
  /** GET /works?search=&page=&limit= */
  async list(params?: { search?: string; page?: number; limit?: number }): Promise<WorkListResponse> {
    const response = await api().get<WorkListResponse>('/works', { params });
    return response.data;
  },

  /** GET /works/:id */
  async getById(id: string): Promise<Work> {
    const response = await api().get<Work>(`/works/${id}`);
    return response.data;
  },

  /** POST /works */
  async create(data: CreateWorkInput): Promise<Work> {
    const response = await api().post<Work>('/works', data);
    return response.data;
  },

  /** PATCH /works/:id */
  async update(id: string, data: UpdateWorkInput): Promise<Work> {
    const response = await api().patch<Work>(`/works/${id}`, data);
    return response.data;
  },

  /** DELETE /works/:id (soft delete) */
  async remove(id: string): Promise<void> {
    await api().delete(`/works/${id}`);
  },
};