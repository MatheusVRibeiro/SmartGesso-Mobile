import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { PermissionGate, useCompanyRole } from '../PermissionGate';
import { useSessionStore } from '../../../store/useSessionStore';

function RoleProbe() {
  const role = useCompanyRole();
  return <Text testID="role">{role ?? 'null'}</Text>;
}

describe('PermissionGate (domain)', () => {
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

  // ─── Anti-owner (V5 princípio 17) ────────────────────────────────────────

  it('useCompanyRole retorna null quando role unknown (NUNCA COMPANY_OWNER)', async () => {
    await render(<RoleProbe />);
    expect(screen.getByTestId('role')).toHaveTextContent('null');
  });

  it('store vazio + allow não satisfeito → NÃO renderiza children', async () => {
    await render(
      <PermissionGate allow={['COMPANY_OWNER']} fallback={<Text>FORBIDDEN</Text>}>
        <Text>SECRET</Text>
      </PermissionGate>,
    );
    expect(screen.queryByText('SECRET')).toBeNull();
    expect(screen.getByText('FORBIDDEN')).toBeTruthy();
  });

  it('store vazio + deny por role → NÃO renderiza children (deny prevalece no unknown)', async () => {
    await render(
      <PermissionGate deny={['COMPANY_OWNER']} fallback={<Text>FORBIDDEN</Text>}>
        <Text>SECRET</Text>
      </PermissionGate>,
    );
    expect(screen.queryByText('SECRET')).toBeNull();
    expect(screen.getByText('FORBIDDEN')).toBeTruthy();
  });

  it('store vazio + permission → NÃO renderiza children (permissions vazias liberam nada)', async () => {
    await render(
      <PermissionGate permission="users:manage" fallback={<Text>FORBIDDEN</Text>}>
        <Text>SECRET</Text>
      </PermissionGate>,
    );
    expect(screen.queryByText('SECRET')).toBeNull();
    expect(screen.getByText('FORBIDDEN')).toBeTruthy();
  });

  it('store vazio sem permission/allow → renderiza children (sem restrição declarada)', async () => {
    await render(
      <PermissionGate>
        <Text>PUBLIC</Text>
      </PermissionGate>,
    );
    expect(screen.getByText('PUBLIC')).toBeTruthy();
  });

  // ─── permission explícita (V5) ───────────────────────────────────────────

  it('permission fornecida + permissions do store contendo o código → renderiza children', async () => {
    useSessionStore.setState({
      permissions: ['users:manage', 'finance:view'],
      role: 'MANAGER',
    });
    await render(
      <PermissionGate permission="users:manage">
        <Text>SECRET</Text>
      </PermissionGate>,
    );
    expect(screen.getByText('SECRET')).toBeTruthy();
  });

  it('permission fornecida + permissions do store SEM o código → fallback', async () => {
    useSessionStore.setState({
      permissions: ['finance:view'],
      role: 'FINANCE',
    });
    await render(
      <PermissionGate permission="users:manage" fallback={<Text>FORBIDDEN</Text>}>
        <Text>SECRET</Text>
      </PermissionGate>,
    );
    expect(screen.queryByText('SECRET')).toBeNull();
    expect(screen.getByText('FORBIDDEN')).toBeTruthy();
  });

  // ─── allow/deny por role (compatibilidade V3) ────────────────────────────

  it('role no store + allow correspondente → renderiza children', async () => {
    useSessionStore.setState({ role: 'FINANCE' });
    await render(
      <PermissionGate allow={['COMPANY_OWNER', 'FINANCE']}>
        <Text>SECRET</Text>
      </PermissionGate>,
    );
    expect(screen.getByText('SECRET')).toBeTruthy();
  });

  it('role fora do allow → fallback', async () => {
    useSessionStore.setState({ role: 'SALES' });
    await render(
      <PermissionGate allow={['FINANCE']} fallback={<Text>FORBIDDEN</Text>}>
        <Text>SECRET</Text>
      </PermissionGate>,
    );
    expect(screen.queryByText('SECRET')).toBeNull();
    expect(screen.getByText('FORBIDDEN')).toBeTruthy();
  });

  it('deny tem precedência sobre allow', async () => {
    useSessionStore.setState({ role: 'MANAGER' });
    await render(
      <PermissionGate
        allow={['MANAGER', 'COMPANY_OWNER']}
        deny={['MANAGER']}
        fallback={<Text>FORBIDDEN</Text>}
      >
        <Text>SECRET</Text>
      </PermissionGate>,
    );
    expect(screen.queryByText('SECRET')).toBeNull();
    expect(screen.getByText('FORBIDDEN')).toBeTruthy();
  });

  // ─── role do currentUser (legado, sem store.role) ────────────────────────

  it('usa currentUser.role como fonte legada quando store.role é null', async () => {
    useSessionStore.setState({
      currentUser: {
        id: '1',
        name: 'Teste',
        email: 't@t.com',
        activeCompanyId: 'c1',
        role: 'MANAGER',
      },
    });
    await render(
      <PermissionGate allow={['MANAGER']}>
        <Text>SECRET</Text>
      </PermissionGate>,
    );
    expect(screen.getByText('SECRET')).toBeTruthy();
  });

  it('store.role tem precedência sobre currentUser.role', async () => {
    useSessionStore.setState({
      role: 'SALES',
      currentUser: {
        id: '1',
        name: 'Teste',
        email: 't@t.com',
        activeCompanyId: 'c1',
        role: 'MANAGER',
      },
    });
    await render(
      <PermissionGate allow={['MANAGER']} fallback={<Text>FORBIDDEN</Text>}>
        <Text>SECRET</Text>
      </PermissionGate>,
    );
    expect(screen.queryByText('SECRET')).toBeNull();
    expect(screen.getByText('FORBIDDEN')).toBeTruthy();
  });
});
