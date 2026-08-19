// ─── Usuários da empresa (Fase 7) ───────────────────────────────────────────

/**
 * Função do usuário dentro da empresa.
 *
 * A API ainda NÃO expõe endpoint de membros da empresa (verificado em
 * SmartGesso-API/src/modules — não há GET /company/members nem convite).
 * Este tipo espelha o modelo CompanyMember do Prisma (roles: MemberRole[])
 * e será usado quando o endpoint existir.
 */
export type CompanyUserRole = 'PROPRIETARIO' | 'FINANCEIRO' | 'INSTALADOR';

export type CompanyUserStatus = 'ATIVO' | 'INATIVO';

export interface CompanyUser {
  id: string;
  name: string;
  email: string;
  role: CompanyUserRole;
  status: CompanyUserStatus;
  joinedAt: string;
}

export const COMPANY_USER_ROLE_LABELS: Record<CompanyUserRole, string> = {
  PROPRIETARIO: 'Proprietário',
  FINANCEIRO: 'Financeiro',
  INSTALADOR: 'Instalador',
};