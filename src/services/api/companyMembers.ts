import { getApiClient } from './client';
import type {
  CompanyMember,
  CompanyMemberStatus,
  CompanyPermissionsResult,
  CompanyUserRole,
  InviteCompanyMemberInput,
  InviteCompanyMemberResult,
} from '../../types/companyMember';

function api() {
  return getApiClient();
}

/**
 * Módulo tipado de membros da empresa (V3 §57 — /company/members).
 *
 * Endpoints reais do SmartGesso-API (prefixo api/v1):
 * - GET    /company/members            → lista (include user: name/email)
 * - POST   /company/members/invite     → { email, role, name? }
 * - PATCH  /company/members/:id        → { role?, status? }
 * - PATCH  /company/members/:id/activate
 * - PATCH  /company/members/:id/deactivate
 * - DELETE /company/members/:id
 * - GET    /company/permissions        → { role, status, permissions[] }
 */
export const companyMembersService = {
  /** GET /company/members — lista membros da empresa ativa. */
  async list(): Promise<CompanyMember[]> {
    const response = await api().get<CompanyMember[]>('/company/members');
    return response.data;
  },

  /** POST /company/members/invite — convida por e-mail + função. */
  async invite(data: InviteCompanyMemberInput): Promise<InviteCompanyMemberResult> {
    const response = await api().post<InviteCompanyMemberResult>(
      '/company/members/invite',
      data,
    );
    return response.data;
  },

  /** PATCH /company/members/:id — atualiza role/status (rejeita INATIVO para isOwner). */
  async update(
    id: string,
    data: { role?: CompanyUserRole; status?: CompanyMemberStatus },
  ): Promise<CompanyMember> {
    const response = await api().patch<CompanyMember>(`/company/members/${id}`, data);
    return response.data;
  },

  /** PATCH /company/members/:id/activate — status ATIVO + joinedAt. */
  async activate(id: string): Promise<CompanyMember> {
    const response = await api().patch<CompanyMember>(`/company/members/${id}/activate`);
    return response.data;
  },

  /** PATCH /company/members/:id/deactivate — status INATIVO (rejeita isOwner). */
  async deactivate(id: string): Promise<CompanyMember> {
    const response = await api().patch<CompanyMember>(`/company/members/${id}/deactivate`);
    return response.data;
  },

  /** GET /company/permissions — perfil + permissões do usuário atual. */
  async getPermissions(): Promise<CompanyPermissionsResult> {
    const response = await api().get<CompanyPermissionsResult>('/company/permissions');
    return response.data;
  },
};