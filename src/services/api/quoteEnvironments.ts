import { getApiClient } from './client';
import type {
  QuoteEnvironment,
  QuoteEnvironmentMeasurement,
  CreateEnvironmentInput,
  UpdateEnvironmentInput,
  CreateEnvironmentMeasurementInput,
  UpdateEnvironmentMeasurementInput,
} from '../../types/quoteEnvironment';

function api() {
  return getApiClient();
}

/** Módulo tipado de ambientes de orçamento (M3 — service layer). */
export const quoteEnvironmentsService = {
  /** GET /quotes/:quoteId/environments */
  async listEnvironments(quoteId: string): Promise<QuoteEnvironment[]> {
    const response = await api().get<QuoteEnvironment[]>(
      `/quotes/${quoteId}/environments`
    );
    return response.data;
  },

  /** POST /quotes/:quoteId/environments */
  async createEnvironment(
    quoteId: string,
    data: CreateEnvironmentInput
  ): Promise<QuoteEnvironment> {
    const response = await api().post<QuoteEnvironment>(
      `/quotes/${quoteId}/environments`,
      data
    );
    return response.data;
  },

  /** PATCH /quotes/:quoteId/environments/:environmentId */
  async updateEnvironment(
    quoteId: string,
    environmentId: string,
    data: UpdateEnvironmentInput
  ): Promise<QuoteEnvironment> {
    const response = await api().patch<QuoteEnvironment>(
      `/quotes/${quoteId}/environments/${environmentId}`,
      data
    );
    return response.data;
  },

  /** DELETE /quotes/:quoteId/environments/:environmentId */
  async removeEnvironment(
    quoteId: string,
    environmentId: string
  ): Promise<void> {
    await api().delete(`/quotes/${quoteId}/environments/${environmentId}`);
  },

  /** POST /quotes/:quoteId/environments/:environmentId/measurements */
  async addMeasurement(
    quoteId: string,
    environmentId: string,
    data: CreateEnvironmentMeasurementInput
  ): Promise<QuoteEnvironmentMeasurement> {
    const response = await api().post<QuoteEnvironmentMeasurement>(
      `/quotes/${quoteId}/environments/${environmentId}/measurements`,
      data
    );
    return response.data;
  },

  /** PATCH /quotes/:quoteId/environments/:environmentId/measurements/:id */
  async updateMeasurement(
    quoteId: string,
    environmentId: string,
    measurementId: string,
    data: UpdateEnvironmentMeasurementInput
  ): Promise<QuoteEnvironmentMeasurement> {
    const response = await api().patch<QuoteEnvironmentMeasurement>(
      `/quotes/${quoteId}/environments/${environmentId}/measurements/${measurementId}`,
      data
    );
    return response.data;
  },
};
