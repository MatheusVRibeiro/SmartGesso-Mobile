import { getApiClient } from './client';
import { LoginRequest, LoginResponse, User } from '../types/auth';

const api = () => getApiClient();

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api().post<LoginResponse>(
      '/platform/auth/login',
      data
    );
    return response.data;
  },

  refresh: async (refreshToken: string) => {
    const response = await api().post('/platform/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  me: async (): Promise<User> => {
    const response = await api().get<{ data: User }>('/platform/auth/me');
    return response.data.data;
  },
};
