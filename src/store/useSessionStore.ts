import { create } from 'zustand';
import type { AuthUser, SessionStatus } from '../types/auth';
import type { CompanyResult } from '../types/company';

// ─── State shape ────────────────────────────────────────────────────────────

export interface SessionState {
  /** Current session lifecycle status */
  sessionStatus: SessionStatus;
  /** Authenticated user profile (from GET /auth/me) */
  currentUser: AuthUser | null;
  /** Active company (from GET /auth/companies, matched by activeCompanyId) */
  activeCompany: CompanyResult | null;
  /** User's permission codes */
  permissions: string[];
  /** Company access status */
  accessStatus: string | null;

  // ── Actions ──────────────────────────────────────────────────────────────
  /** Set the full session on login / restore */
  setSession: (user: AuthUser, company?: CompanyResult | null) => void;
  /** Update the user profile independently */
  setUser: (user: AuthUser) => void;
  /** Switch the active company */
  setActiveCompany: (company: CompanyResult | null) => void;
  /** Replace the permissions list */
  setPermissions: (permissions: string[]) => void;
  /** Update access status */
  setAccessStatus: (status: string | null) => void;
  /** Transition to unauthenticated — clears all state */
  clearSession: () => void;
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useSessionStore = create<SessionState>((set) => ({
  // ── Initial state ──────────────────────────────────────────────────────
  sessionStatus: 'initializing',
  currentUser: null,
  activeCompany: null,
  permissions: [],
  accessStatus: null,

  // ── Actions ─────────────────────────────────────────────────────────────
  setSession: (user, company = null) =>
    set({
      sessionStatus: 'authenticated',
      currentUser: user,
      activeCompany: company,
    }),

  setUser: (user) => set({ currentUser: user }),

  setActiveCompany: (company) => set({ activeCompany: company }),

  setPermissions: (permissions) => set({ permissions }),

  setAccessStatus: (status) => set({ accessStatus: status }),

  clearSession: () =>
    set({
      sessionStatus: 'unauthenticated',
      currentUser: null,
      activeCompany: null,
      permissions: [],
      accessStatus: null,
    }),
}));
