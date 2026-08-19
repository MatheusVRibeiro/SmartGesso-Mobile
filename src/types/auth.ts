// ─── Legacy types (kept for backward compat with src/api/, src/context/) ───

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  activeCompanyId?: string | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'company_admin' | 'manager' | 'employee';

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthContextData extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

// ─── New types (services layer — verified against NestJS auth.service.ts) ──

import type { CompanyProfileRole } from './permissions';

/** Minimal user returned by GET /auth/me (subset of legacy User) */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  activeCompanyId: string | null;
  /**
   * Perfil V3 (ex.: COMPANY_OWNER). Ainda não retornado pela API
   * (GET /auth/me não expõe role) — o PermissionGate usa COMPANY_OWNER
   * como padrão enquanto o campo não existir, sem quebrar o fluxo atual.
   */
  role?: CompanyProfileRole | null;
}

/** Token pair returned by all token-issuing endpoints */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AcceptInvitationRequest {
  token: string;
  password: string;
}

export interface AcceptInvitationResponse extends AuthTokens {
  user: { id: string; name: string; email: string };
  companyId: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface SwitchCompanyRequest {
  companyId: string;
}

export interface SwitchCompanyResponse extends AuthTokens {
  activeCompanyId: string;
}

export type SessionStatus =
  | 'initializing'
  | 'authenticated'
  | 'unauthenticated';
