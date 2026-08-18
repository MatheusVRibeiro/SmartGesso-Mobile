import { useSessionStore } from '../useSessionStore';

describe('useSessionStore', () => {
  beforeEach(() => {
    useSessionStore.setState({
      sessionStatus: 'initializing',
      currentUser: null,
      activeCompany: null,
      permissions: [],
      accessStatus: null,
    });
  });

  it('tem estado inicial correto', () => {
    const state = useSessionStore.getState();
    expect(state.sessionStatus).toBe('initializing');
    expect(state.currentUser).toBeNull();
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

  it('clearSession limpa tudo', () => {
    useSessionStore.getState().clearSession();
    const state = useSessionStore.getState();
    expect(state.sessionStatus).toBe('unauthenticated');
    expect(state.currentUser).toBeNull();
    expect(state.activeCompany).toBeNull();
    expect(state.permissions).toEqual([]);
  });
});
