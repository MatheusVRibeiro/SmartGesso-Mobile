// ─── Membros da empresa (V3 §57 — CompanyMember) ─────────────────────────────

/**
 * Função do usuário dentro da empresa (enum Prisma `CompanyUserRole`).
 *
 * A API expõe GET /company/members (lista), POST /company/members/invite,
 * PATCH /company/members/:id (+ /activate e /deactivate) e
 * GET /company/permissions — ver `company-members-v3.md`.
 */
export type CompanyUserRole =
  | 'COMPANY_OWNER'
  | 'MANAGER'
  | 'SALES'
  | 'FINANCE'
  | 'INSTALLER'
  | 'PRODUCTION';

/**
 * Status do membro (enum Prisma `CompanyMemberStatus` — PT-BR!).
 * ⚠️ Nunca use 'ACTIVE'/'INVITED': a API usa ATIVO/INATIVO/CONVIDADO.
 */
export type CompanyMemberStatus = 'ATIVO' | 'INATIVO' | 'CONVIDADO';

export interface CompanyMember {
  id: string;
  companyId: string;
  userId: string;
  role: CompanyUserRole;
  status: CompanyMemberStatus;
  isOwner: boolean;
  joinedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  /** Usuário relacionado (GET /company/members inclui name/email). */
  user?: { id: string; name: string; email: string } | null;
}

/** Entrada do convite (POST /company/members/invite). */
export interface InviteCompanyMemberInput {
  email: string;
  role: CompanyUserRole;
  name?: string;
}

/** Resposta do convite — token para o convidado aceitar. */
export interface InviteCompanyMemberResult {
  member: CompanyMember;
  invite: { inviteToken: string; expiresAt: string };
}

/** Perfil + permissões do usuário atual (GET /company/permissions). */
export interface CompanyPermissionsResult {
  role: CompanyUserRole;
  status: CompanyMemberStatus;
  permissions: string[];
}

export const COMPANY_MEMBER_ROLE_LABELS: Record<CompanyUserRole, string> = {
  COMPANY_OWNER: 'Proprietário',
  MANAGER: 'Gerente',
  SALES: 'Vendas',
  FINANCE: 'Financeiro',
  INSTALLER: 'Instalador',
  PRODUCTION: 'Produção',
};

export const COMPANY_MEMBER_STATUS_LABELS: Record<CompanyMemberStatus, string> = {
  ATIVO: 'Ativo',
  INATIVO: 'Inativo',
  CONVIDADO: 'Convidado',
};