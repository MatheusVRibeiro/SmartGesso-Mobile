import type { CompanyUser } from '../types/user';

/**
 * ⚠️ DADOS MOCKADOS (provisórios)
 *
 * A API SmartGesso ainda não expõe endpoint de usuários da empresa
 * (não existe GET /company/members nem POST /company/invite — verificado
 * em SmartGesso-API/src/modules em 2026-08-19). Esta lista local simula a
 * resposta futura para a tela Usuários. Substituir por chamada real quando
 * o endpoint existir.
 */
export const mockCompanyUsers: CompanyUser[] = [
  {
    id: 'mock-user-001',
    name: 'Ana Beatriz Souza',
    email: 'ana.souza@empresa.com.br',
    role: 'PROPRIETARIO',
    status: 'ATIVO',
    joinedAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'mock-user-002',
    name: 'Carlos Eduardo Lima',
    email: 'carlos.lima@empresa.com.br',
    role: 'FINANCEIRO',
    status: 'ATIVO',
    joinedAt: '2026-02-03T14:30:00.000Z',
  },
  {
    id: 'mock-user-003',
    name: 'João Pedro Martins',
    email: 'joao.martins@empresa.com.br',
    role: 'INSTALADOR',
    status: 'ATIVO',
    joinedAt: '2026-03-15T10:00:00.000Z',
  },
  {
    id: 'mock-user-004',
    name: 'Mariana Oliveira',
    email: 'mariana.oliveira@empresa.com.br',
    role: 'INSTALADOR',
    status: 'INATIVO',
    joinedAt: '2026-04-22T16:45:00.000Z',
  },
  {
    id: 'mock-user-005',
    name: 'Rafael Almeida',
    email: 'rafael.almeida@empresa.com.br',
    role: 'FINANCEIRO',
    status: 'INATIVO',
    joinedAt: '2026-05-08T11:20:00.000Z',
  },
];