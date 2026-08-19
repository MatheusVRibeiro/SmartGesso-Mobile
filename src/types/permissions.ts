// ─── Perfis e permissões da empresa (V3 — Usuários e Permissões) ────────────

/**
 * Perfis possíveis no SmartGesso (V3):
 *
 * - COMPANY_OWNER — dono da empresa (acesso total)
 * - MANAGER       — gerência (operações + gestão)
 * - SALES         — clientes, medições e orçamentos
 * - FINANCE       — recebimentos, cobranças e despesas
 * - INSTALLER     — serviços, agenda, checklist e fotos
 * - PRODUCTION    — produção
 *
 * A API ainda NÃO expõe o perfil do usuário em GET /auth/me nem um endpoint
 * GET /company/permissions (verificado em SmartGesso-API/src/modules).
 * Enquanto isso, o mobile usa o perfil local com fallback COMPANY_OWNER para
 * não quebrar o fluxo atual — o backend continua sendo a autoridade final.
 */
export type CompanyProfileRole =
  | 'COMPANY_OWNER'
  | 'MANAGER'
  | 'SALES'
  | 'FINANCE'
  | 'INSTALLER'
  | 'PRODUCTION';

export const COMPANY_PROFILE_ROLES: readonly CompanyProfileRole[] = [
  'COMPANY_OWNER',
  'MANAGER',
  'SALES',
  'FINANCE',
  'INSTALLER',
  'PRODUCTION',
] as const;

/** Perfil padrão quando o usuário ainda não tem role (não quebra o fluxo atual). */
export const DEFAULT_COMPANY_PROFILE_ROLE: CompanyProfileRole = 'COMPANY_OWNER';

/** Perfis com acesso a custos e margens (V3 — custos/margens restritos). */
export const COST_VIEW_ROLES: readonly CompanyProfileRole[] = [
  'COMPANY_OWNER',
  'MANAGER',
  'FINANCE',
] as const;

/** Perfis com acesso à gestão de usuários da empresa. */
export const USER_MANAGE_ROLES: readonly CompanyProfileRole[] = [
  'COMPANY_OWNER',
  'MANAGER',
] as const;
