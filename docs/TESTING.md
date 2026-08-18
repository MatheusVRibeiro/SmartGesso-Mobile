# Testes — SmartGesso Mobile

Documentação completa da estratégia de testes, execução e mocks.

---

## Índice

- [Estratégia](#estratégia)
- [Como Rodar Testes](#como-rodar-testes)
- [Estrutura de Testes](#estrutura-de-testes)
- [Mocks](#mocks)
- [Cobertura Alvo](#cobertura-alvo)
- [Testes Obrigatórios (Fase 1)](#testes-obrigatórios-fase-1)

---

## Estratégia

O SmartGesso Mobile utiliza uma estratégia de testes em camadas:

```
┌─────────────────────────────────────────────────────────────┐
│                    PIRÂMIDE DE TESTES                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                        ╱╲                                  │
│                       ╱  ╲                                 │
│                      ╱ E2E╲        ← Poucos, lentos       │
│                     ╱──────╲         (Maestro/Detox)       │
│                    ╱        ╲                              │
│                   ╱ Integração╲   ← Médio, cobrem fluxos   │
│                  ╱────────────╲    (RNTL + mocks)          │
│                 ╱              ╲                           │
│                ╱    Unitários   ╲  ← Muitos, rápidos      │
│               ╱──────────────────╲ (Jest puro)            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Camadas de Teste

| Camada | Ferramenta | Velocidade | Cobertura |
|--------|------------|------------|-----------|
| **Unitários** | Jest | ⚡ Rápido | Funções, hooks, utils |
| **Componentes** | Jest + RNTL | 🔶 Médio | Componentes UI |
| **Integração** | Jest + RNTL | 🔶 Médio | Fluxos completos |
| **E2E** | Maestro/Detox | 🐌 Lento | Cenários críticos |

### Ferramentas

| Ferramenta | Versão | Uso |
|------------|--------|-----|
| Jest | ^30.4.2 | Testes unitários |
| React Native Testing Library | ^13.3.3 | Testes de componentes |
| @react-native/jest-preset | ^0.86.2 | Preset Jest para RN |
| jest-expo | ^57.0.4 | Integração Expo + Jest |
| Maestro | — | Testes E2E (futuro) |

---

## Como Rodar Testes

### Todos os Testes

```bash
npm test
```

### Modo Watch

```bash
npm run test:watch
```

### Com Cobertura

```bash
npm test -- --coverage
```

### Arquivo Específico

```bash
npm test -- src/validation/__tests__/schemas.test.ts
```

### Testes de Componentes

```bash
npm test -- --testPathPattern="components"
```

### Ver Tipos (Pré-Commit)

```bash
npm run typecheck
```

### Lint

```bash
npm run lint
```

### Formatação

```bash
npm run format
```

### Verificar Ambiente

```bash
npx expo-doctor
```

---

## Estrutura de Testes

### Organização

```
src/
├── components/
│   └── ui/
│       ├── __tests__/           # Testes de componentes
│       │   ├── AppButton.test.tsx
│       │   ├── AppInput.test.tsx
│       │   └── ...
│       └── AppButton.tsx
│
├── services/
│   └── api/
│       ├── __tests__/           # Testes de serviços
│       │   ├── auth.test.ts
│       │   ├── client.test.ts
│       │   └── ...
│       └── auth.ts
│
├── validation/
│   ├── __tests__/               # Testes de schemas
│   │   └── schemas.test.ts
│   └── schemas.ts
│
└── hooks/
    └── __tests__/               # Testes de hooks
        └── useAuth.test.ts
```

### Convenções de Nomenclatura

```
<arquivo>.test.ts      # Arquivo de teste
<arquivo>.test.tsx     # Arquivo de teste (com JSX)
<arquivo>.spec.ts      # Alternativa (ambos aceitos)
```

### Estrutura de Teste (AAA)

```typescript
describe('NomeDoComponente', () => {
  // Arrange (preparar)
  // Act (agir)
  // Assert (verificar)

  it('deve fazer algo específico', () => {
    // Arrange
    const props = { title: 'Botão' };

    // Act
    render(<AppButton {...props} />);

    // Assert
    expect(screen.getByText('Botão')).toBeTruthy();
  });
});
```

---

## Mocks

### Mock de API

```typescript
// __mocks__/@/services/api/client.ts
export const getApiClient = () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
});

export const toApiError = jest.fn();
```

### Mock de SecureStore

```typescript
// __mocks__/expo-secure-store.ts
export default {
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
};
```

### Mock de React Navigation

```typescript
// __mocks__/@react-navigation/native.ts
export const useNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
});

export const useRoute = () => ({
  params: {},
});
```

### Mock de Expo Router

```typescript
// __mocks__/expo-router.ts
export const router = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};

export const useLocalSearchParams = () => ({});
```

### Mock de Zustand Store

```typescript
// Utilizar estado inicial ou mockar ações
import { useSessionStore } from '@/store/useSessionStore';

beforeEach(() => {
  useSessionStore.setState({
    sessionStatus: 'unauthenticated',
    currentUser: null,
    activeCompany: null,
  });
});
```

### Mock de TanStack Query

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
);
```

### Mock de Rede

```typescript
// Mockar expo-network
jest.mock('expo-network', () => ({
  getNetworkStateAsync: jest.fn().mockResolvedValue({
    isConnected: true,
    isInternetReachable: true,
  }),
}));
```

### Factory de Dados

```typescript
// __factories__/user.ts
export const makeUser = (overrides = {}) => ({
  id: 'usr_123',
  name: 'Usuário Teste',
  email: 'teste@email.com',
  ...overrides,
});

export const makeCompany = (overrides = {}) => ({
  id: 'cmp_456',
  name: 'Empresa Teste',
  slug: 'empresa-teste',
  isActive: true,
  ...overrides,
});
```

---

## Cobertura Alvo

### Metas por Camada

| Camada | Meta | Prioridade |
|--------|------|------------|
| **Serviços (API)** | 90%+ | 🔴 Alta |
| **Hooks** | 85%+ | 🔴 Alta |
| **Validações** | 95%+ | 🔴 Alta |
| **Componentes UI** | 80%+ | 🟡 Média |
| **Telas** | 70%+ | 🟡 Média |
| **Utilitários** | 90%+ | 🔴 Alta |

### Cobertura Geral

- **Mínimo:** 70%
- **Alvo:** 80%
- **Ideal:** 85%+

### Relatório de Cobertura

```bash
npm test -- --coverage --coverageReporters=text-summary
```

### Configuração Jest

```json
// package.json
{
  "jest": {
    "preset": "jest-expo",
    "transformIgnorePatterns": [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)"
    ],
    "setupFilesAfterSetup": [
      "@testing-library/react-native/cleanup-after-each"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 70,
        "functions": 70,
        "lines": 70,
        "statements": 70
      }
    }
  }
}
```

---

## Testes Obrigatórios (Fase 1)

### Autenticação

```typescript
describe('Autenticação', () => {
  it('deve realizar login com credenciais válidas', async () => {
    // Arrange
    const email = 'a.mult@example.com';
    const password = 'Senha@123456';

    // Act
    const result = await authApi.login({ email, password });

    // Assert
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user.email).toBe(email);
  });

  it('deve rejeitar login com credenciais inválidas', async () => {
    // Arrange
    const email = 'invalido@email.com';
    const password = 'senhaerrada';

    // Act & Assert
    await expect(authApi.login({ email, password }))
      .rejects.toThrow();
  });

  it('deve aceitar convite', async () => {
    // Arrange
    const token = 'invite_token_123';
    const password = 'NovaSenha@123';

    // Act
    const result = await authApi.acceptInvitation({ token, password });

    // Assert
    expect(result.accessToken).toBeDefined();
    expect(result.companyId).toBeDefined();
  });

  it('deve solicitar recuperação de senha', async () => {
    // Arrange
    const email = 'a.mult@example.com';

    // Act
    const result = await authApi.forgotPassword({ email });

    // Assert
    expect(result.message).toBeDefined();
  });

  it('deve renovar access token via refresh', async () => {
    // Arrange
    const refreshToken = 'valid_refresh_token';

    // Act
    const result = await authApi.refresh({ refreshToken });

    // Assert
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.refreshToken).not.toBe(refreshToken); // Rotação
  });

  it('deve fazer logout e limpar tokens', async () => {
    // Arrange
    await SecureTokenStorage.setAccessToken('token');
    await SecureTokenStorage.setRefreshToken('token');

    // Act
    await authApi.logout();

    // Assert
    const accessToken = await SecureTokenStorage.getAccessToken();
    const refreshToken = await SecureTokenStorage.getRefreshToken();
    expect(accessToken).toBeNull();
    expect(refreshToken).toBeNull();
  });
});
```

### Empresa

```typescript
describe('Empresa', () => {
  it('deve listar empresas do usuário', async () => {
    // Act
    const result = await companiesApi.list();

    // Assert
    expect(result.data).toBeInstanceOf(Array);
    expect(result.data.length).toBeGreaterThan(0);
  });

  it('deve trocar empresa ativa', async () => {
    // Arrange
    const companyId = 'cmp_789';

    // Act
    const result = await companiesApi.switchCompany(companyId);

    // Assert
    expect(result.activeCompanyId).toBe(companyId);
    expect(result.accessToken).toBeDefined();
  });

  it('deve limpar cache ao trocar empresa', async () => {
    // Arrange
    const queryClient = new QueryClient();
    queryClient.setQueryData(['clients', 'cmp_456'], mockClients);

    // Act
    await switchCompany('cmp_789');

    // Assert
    const oldData = queryClient.getQueryData(['clients', 'cmp_456']);
    expect(oldData).toBeUndefined();
  });
});
```

### Suspensão

```typescript
describe('Suspensão', () => {
  it('deve bloquear acesso quando empresa está suspensa', async () => {
    // Arrange
    mockApi.response(402, { code: 'COMPANY_ACCESS_SUSPENDED' });

    // Act & Assert
    await expect(fetchData()).rejects.toThrow('COMPANY_ACCESS_SUSPENDED');
  });

  it('deve redirecionar para tela de suspensão', async () => {
    // Arrange
    const error = { code: 'COMPANY_ACCESS_SUSPENDED' };

    // Act
    handleError(error);

    // Assert
    expect(router.push).toHaveBeenCalledWith('/access-suspended');
  });
});
```

### Segurança

```typescript
describe('Segurança', () => {
  it('deve armazenar tokens no SecureStore', async () => {
    // Arrange
    const accessToken = 'token_123';
    const refreshToken = 'refresh_456';

    // Act
    await saveTokens(accessToken, refreshToken);

    // Assert
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('accessToken', accessToken);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('refreshToken', refreshToken);
  });

  it('NUNCA deve armazenar token em AsyncStorage', async () => {
    // Assert
    expect(AsyncStorage.setItem).not.toHaveBeenCalledWith(
      expect.stringContaining('token'),
      expect.anything()
    );
  });

  it('deve islar cache por empresa', async () => {
    // Arrange
    const queryClient = new QueryClient();

    // Act
    queryClient.setQueryData(['clients', 'cmp_456'], clientsA);
    queryClient.setQueryData(['clients', 'cmp_789'], clientsB);

    // Assert
    expect(queryClient.getQueryData(['clients', 'cmp_456'])).toEqual(clientsA);
    expect(queryClient.getQueryData(['clients', 'cmp_789'])).toEqual(clientsB);
  });
});
```

### Componentes

```typescript
describe('Componentes', () => {
  it('deve renderizar LoadingState', () => {
    render(<LoadingState />);
    expect(screen.getByTestId('loading-indicator')).toBeTruthy();
  });

  it('deve renderizar ErrorState com mensagem', () => {
    render(<ErrorState message="Erro ao carregar" />);
    expect(screen.getByText('Erro ao carregar')).toBeTruthy();
  });

  it('deve renderizar EmptyState com ação', () => {
    const onPress = jest.fn();
    render(
      <EmptyState
        title="Nenhum item"
        action={{ label: "Novo", onPress }}
      />
    );
    fireEvent.press(screen.getByText('Novo'));
    expect(onPress).toHaveBeenCalled();
  });

  it('deve desabilitar botão quando loading', () => {
    render(<AppButton title="Salvar" loading />);
    expect(screen.getByTestId('button')).toBeDisabled();
  });

  it('deve exibir erro de validação no input', () => {
    render(<AppInput label="Email" error="Email inválido" />);
    expect(screen.getByText('Email inválido')).toBeTruthy();
  });

  it('deve renderizar PermissionGate quando tem permissão', () => {
    render(
      <PermissionGate permission="clients.create">
        <Text>Acesso permitido</Text>
      </PermissionGate>
    );
    expect(screen.getByText('Acesso permitido')).toBeTruthy();
  });
});
```

---

## Testes de Integração

### Fluxo de Login Completo

```typescript
describe('Fluxo de Login', () => {
  it('deve realizar login completo e navegar para empresa', async () => {
    // Arrange
    const email = 'a.mult@example.com';
    const password = 'Senha@123456';
    
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LoginScreen />
        </AuthProvider>
      </QueryClientProvider>
    );

    // Act
    fireEvent.changeText(screen.getByLabelText('Email'), email);
    fireEvent.changeText(screen.getByLabelText('Senha'), password);
    fireEvent.press(screen.getByText('Entrar'));

    // Assert
    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/select-company');
    });
  });
});
```

---

## Próximos Passos

1. ✅ Configuração Jest completa
2. ✅ Testes de autenticação implementados
3. ✅ Testes de componentes UI
4. 🔄 Adicionar testes de integração
5. 🔄 Configurar Maestro para E2E
6. 🔄 Adicionar testes de performance
7. 🔄 CI/CD com cobertura mínima

---

**Documento:** TESTING.md  
**Última atualização:** Agosto 2026  
**Projeto:** SmartGesso Mobile