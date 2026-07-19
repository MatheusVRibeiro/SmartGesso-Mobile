import { getApiClient } from './client';
import { Company, CompanyListResponse } from '../types/company';

const api = () => getApiClient();

export const companyApi = {
  list: async (page = 1, limit = 20): Promise<CompanyListResponse> => {
    const response = await api().get<CompanyListResponse>('/platform/companies', {
      params: { page, limit },
    });
    return response.data;
  },

  getById: async (id: string): Promise<Company> => {
    const response = await api().get<{ data: Company }>(
      `/platform/companies/${id}`
    );
    return response.data.data;
  },
};
