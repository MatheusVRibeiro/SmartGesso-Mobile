// ─── Legacy types (kept for backward compat with src/api/) ──────────────────

export interface Company {
  id: string;
  name: string;
  cnpj?: string;
  phone?: string;
  email?: string;
  address?: Address;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface CompanyListResponse {
  data: Company[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── New types (services layer — matches real NestJS API shapes) ────────────

/** UserStatus enum shared by User and CompanyMember in Prisma schema */
export type CompanyMemberStatus =
  | 'INVITED'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'BLOCKED';

/** Company summary within CompanyResult */
export interface CompanySummary {
  id: string;
  tradeName: string;
  document: string;
}

/** Membership info within CompanyResult */
export interface CompanyMembership {
  isOwner: boolean;
  status: CompanyMemberStatus;
}

/**
 * Shape returned by GET /auth/companies (each element in the array).
 * Verified against SmartGesso-API auth.service.ts — the real response is:
 *   { company: { id, tradeName, document }, member: { isOwner, status } }
 */
export interface CompanyResult {
  company: CompanySummary;
  member: CompanyMembership;
}
