import { useSessionStore } from '../useSessionStore';

describe('useSessionStore', () => {
  beforeEach(() => {
    useSessionStore.setState({
      sessionStatus: 'initializing',
      currentUser: null,
      activeCompany: null,
      permissions: [],
      role: null,
      accessStatus: null,
    });
  });

  it('tem estado inicial correto', () => {
    const state = useSessionStore.getState();
    expect(state.sessionStatus).toBe('initializing');
    expect(state.currentUser).toBeNull();
    expect(state.permissions).toEqual([]);
    expect(state.role).toBeNull();
  });

  it('setSession atualiza user, company e sessionStatus', () => {
    const mockUser = { id: '1', name: 'Teste', email: 'teste@test.com', activeCompanyId: 'c1' } as const;
    const mockCompany = {
      company: { id: 'c1', tradeName: 'Empresa', document: 'doc-1' },
      member: { isOwner: true, status: 'ACTIVE' as const },
    } as const;

    useSessionStore.getState().setSession(mockUser, mockCompany);

    const state = useSessionStore.getState();
    expect(state.sessionStatus).toBe('authenticated');
    expect(state.currentUser).toEqual(mockUser);
    expect(state.activeCompany).toEqual(mockCompany);
  });

  it('setPermissions e setRole atualizam permissões e perfil', () => {
    useSessionStore.getState().setPermissions(['users:manage', 'finance:view']);
    useSessionStore.getState().setRole('MANAGER');

    const state = useSessionStore.getState();
    expect(state.permissions).toEqual(['users:manage', 'finance:view']);
    expect(state.role).toBe('MANAGER');
  });

  it('setRole(null) representa estado unknown (nunca owner)', () => {
    useSessionStore.getState().setRole('COMPANY_OWNER');
    useSessionStore.getState().setRole(null);
    expect(useSessionStore.getState().role).toBeNull();
  });

  it('clearSession limpa tudo', () => {
    useSessionStore.getState().setPermissions(['users:manage']);
    useSessionStore.getState().setRole('MANAGER');
    useSessionStore.getState().clearSession();
    const state = useSessionStore.getState();
    expect(state.sessionStatus).toBe('unauthenticated');
    expect(state.currentUser).toBeNull();
    expect(state.activeCompany).toBeNull();
    expect(state.permissions).toEqual([]);
    expect(state.role).toBeNull();
  });
});
