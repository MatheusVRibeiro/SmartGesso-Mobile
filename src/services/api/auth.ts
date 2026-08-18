import { getApiClient } from './client';
import type {
  LoginRequest,
  LoginResponse,
  AcceptInvitationRequest,
  AcceptInvitationResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  SwitchCompanyRequest,
  SwitchCompanyResponse,
  AuthUser,
} from '../../types/auth';
import type { CompanyResult } from '../../types/company';

function api() {
  return getApiClient();
}

/**
 * Typed auth module covering every user-facing auth endpoint.
 * All functions return fully typed payloads; errors are mapped by the
 * centralised client to an ApiError with a discriminated `code`.
 */
export const authService = {
  /** POST /auth/login */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api().post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  /** POST /auth/refresh (used internally by the interceptor; exposed for manual use) */
  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await api().post<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      { refreshToken },
    );
    return response.data;
  },

  /** POST /auth/logout */
  async logout(): Promise<{ ok: true }> {
    await api().post('/auth/logout');
    return { ok: true };
  },

  /** POST /auth/logout-all */
  async logoutAll(): Promise<{ ok: true }> {
    await api().post('/auth/logout-all');
    return { ok: true };
  },

  /** POST /auth/forgot-password */
  async forgotPassword(data: ForgotPasswordRequest): Promise<{ ok: true }> {
    await api().post('/auth/forgot-password', data);
    return { ok: true };
  },

  /** POST /auth/reset-password */
  async resetPassword(data: ResetPasswordRequest): Promise<{ ok: true }> {
    await api().post('/auth/reset-password', data);
    return { ok: true };
  },

  /** POST /auth/accept-invitation */
  async acceptInvitation(data: AcceptInvitationRequest): Promise<AcceptInvitationResponse> {
    const response = await api().post<AcceptInvitationResponse>('/auth/accept-invitation', data);
    return response.data;
  },

  /** GET /auth/me — returns the authenticated user's minimal profile */
  async me(): Promise<AuthUser> {
    const response = await api().get<AuthUser>('/auth/me');
    return response.data;
  },

  /** GET /auth/companies — returns all companies the user has access to */
  async companies(): Promise<CompanyResult[]> {
    const response = await api().get<CompanyResult[]>('/auth/companies');
    return response.data;
  },

  /** POST /auth/switch-company — rotate tokens to a new active company */
  async switchCompany(data: SwitchCompanyRequest): Promise<SwitchCompanyResponse> {
    const response = await api().post<SwitchCompanyResponse>('/auth/switch-company', data);
    return response.data;
  },
};
