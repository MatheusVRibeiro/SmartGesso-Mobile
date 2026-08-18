# Arquitetura do SmartGesso Mobile

Visão geral da arquitetura do sistema, estrutura de pastas e fluxos principais.

---

## Índice

- [Diagrama de Componentes](#diagrama-de-componentes)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Fluxo de Autenticação](#fluxo-de-autenticação)
- [Fluxo de Empresa](#fluxo-de-empresa)
- [Estado Global (Zustand Store)](#estado-global-zustand-store)
- [Dados Remotos (TanStack Query)](#dados-remotos-tanstack-query)

---

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                      SmartGesso Mobile                         │
│                        (Expo)                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   App Router │  │   Zustand    │  │   TanStack Query     │  │
│  │   (Rotas)    │  │   (Estado)   │  │   (Dados Remotos)    │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│          │                 │                    │               │
│          └─────────────────┼────────────────────┘               │
│                            │                                    │
│                            ▼                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Services Layer                         │ │
│  │  ┌─────────┐  ┌─────────────┐  ┌──────────────────────┐  │ │
│  │  │  Auth   │  │  Companies  │  │   API Client (Axios) │  │ │
│  │  └─────────┘  └─────────────┘  └──────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            │                                    │
│                            ▼                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   SecureStore                              │ │
│  │  (Tokens: Access + Refresh)                               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SmartGesso API                              │
│                    (NestJS + Prisma)                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────┐ ┌───────────┐ ┌────────┐ ┌────────┐ ┌────────────┐  │
│  │ Auth │ │ Companies │ │ Clients│ │ Orders │ │  Finance   │  │
│  └──────┘ └───────────┘ └────────┘ └────────┘ └────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MySQL (Hostinger)                           │
│                    Multiempresa                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Estrutura de Pastas

```
smartgesso-mobile/
├── app/                          # Expo Router (rotas)
│   ├── (auth)/                   # Rotas públicas (não autenticado)
│   │   ├── _layout.tsx          # Layout do grupo auth
│   │   ├── login.tsx            # Tela de login
│   │   ├── forgot-password.tsx  # Recuperação de senha
│   │   ├── reset-password.tsx   # Redefinição de senha
│   │   └── accept-invitation.tsx # Aceitar convite
│   │
│   ├── (company)/                # Seleção de empresa
│   │   ├── _layout.tsx          # Layout do grupo company
│   │   ├── select-company.tsx   # Lista de empresas
│   │   ├── company-profile.tsx  # Perfil da empresa
│   │   └── access-suspended.tsx # Acesso suspenso
│   │
│   ├── (app)/                    # Rotas protegidas (autenticado)
│   │   ├── _layout.tsx          # Layout do grupo app
│   │   ├── profile.tsx          # Perfil do usuário
│   │   └── (tabs)/              # Abas principais
│   │       ├── _layout.tsx      # Layout das abas
│   │       ├── index.tsx        # Dashboard
│   │       ├── orcamentos.tsx   # Orçamentos
│   │       ├── servicos.tsx     # Serviços
│   │       ├── novo.tsx         # Novo item
│   │       └── mais.tsx         # Mais opções
│   │
│   ├── _layout.tsx               # Layout raiz (QueryClient + SafeArea)
│   ├── index.tsx                 # Entry point / redirecionamento
│   └── +not-found.tsx           # Tela 404
│
├── src/                          # Código-fonte
│   ├── api/                      # Camada de API (legado)
│   │   ├── auth.ts              # Funções de autenticação
│   │   ├── client.ts            # Cliente HTTP
│   │   └── companies.ts         # Funções de empresa
│   │
│   ├── components/               # Componentes reutilizáveis
│   │   └── ui/                  # Componentes de UI
│   │       ├── index.ts         # Barrel exports
│   │       ├── AppButton.tsx    # Botão padronizado
│   │       ├── AppCard.tsx      # Card
│   │       ├── AppInput.tsx     # Input de texto
│   │       ├── AppSnackbar.tsx  # Notificação
│   │       ├── ConfirmDialog.tsx # Diálogo de confirmação
│   │       ├── EmptyState.tsx   # Estado vazio
│   │       ├── ErrorState.tsx   # Estado de erro
│   │       ├── LoadingState.tsx # Loading spinner
│   │       ├── OfflineBanner.tsx # Banner offline
│   │       ├── PasswordInput.tsx # Input de senha
│   │       ├── PermissionGate.tsx # Controle de permissão
│   │       ├── ScreenContainer.tsx # Container de tela
│   │       └── StatusBadge.tsx  # Badge de status
│   │
│   ├── constants/                # Constantes
│   │   ├── config.ts            # Configurações do app
│   │   └── colors.ts            # Cores (re-export de theme)
│   │
│   ├── context/                  # Contexts React
│   │   └── AuthContext.tsx      # Contexto de autenticação
│   │
│   ├── screens/                  # Telas (componentes de tela)
│   │   ├── Auth/                # Telas de autenticação
│   │   │   └── LoginScreen.tsx
│   │   └── Dashboard/           # Telas do dashboard
│   │       ├── CompaniesListScreen.tsx
│   │       ├── DashboardScreen.tsx
│   │       └── ProfileScreen.tsx
│   │
│   ├── services/                 # Serviços
│   │   ├── api/                 # Camada de API
│   │   │   ├── auth.ts          # Serviços de autenticação
│   │   │   ├── client.ts        # Cliente HTTP (Axios)
│   │   │   └── companies.ts     # Serviços de empresa
│   │   ├── auth/                # Autenticação
│   │   │   └── SecureTokenStorage.ts # Armazenamento seguro
│   │   └── index.ts             # Barrel exports
│   │
│   ├── store/                    # Estado global (Zustand)
│   │   └── useSessionStore.ts   # Store de sessão
│   │
│   ├── theme/                    # Design System
│   │   ├── colors.ts            # Tokens de cor
│   │   ├── typography.ts        # Tokens de tipografia
│   │   ├── spacing.ts           # Tokens de espaçamento
│   │   ├── sizes.ts             # Tokens de tamanho
│   │   ├── borders.ts           # Tokens de borda
│   │   ├── radius.ts            # Tokens de raio
│   │   ├── shadows.ts           # Tokens de sombra
│   │   └── index.ts             # Barrel exports
│   │
│   ├── types/                    # Tipos TypeScript
│   │   ├── api.ts               # Tipos da API
│   │   ├── auth.ts              # Tipos de autenticação
│   │   └── company.ts           # Tipos de empresa
│   │
│   └── validation/               # Validações Zod
│       ├── schemas.ts           # Schemas de validação
│       └── __tests__/           # Testes
│           └── schemas.test.ts
│
├── assets/                       # Recursos estáticos
│   ├── icon.png
│   ├── android-icon-foreground.png
│   ├── android-icon-background.png
│   └── ...
│
├── docs/                         # Documentação
│   ├── ARCHITECTURE.md          # Este arquivo
│   ├── NAVIGATION.md            # Navegação
│   ├── API_INTEGRATION.md       # Integração API
│   ├── SECURITY.md              # Segurança
│   ├── OFFLINE.md               # Offline first
│   ├── DESIGN_SYSTEM.md         # Design system
│   ├── TESTING.md               # Testes
│   └── ROADMAP.md               # Roadmap
│
├── app.config.ts                 # Configuração Expo
├── eas.json                      # Configuração EAS Build
├── tsconfig.json                 # Configuração TypeScript
├── package.json                  # Dependências
├── .env.example                  # Variáveis de ambiente
├── AGENTS.md                     # Regras para agentes
└── README.md                     # Este arquivo
```

---

## Fluxo de Autenticação

### 1. Fluxo Inicial (App Inicia)

```typescript
// No AuthProvider (src/context/AuthContext.tsx)
useEffect(() => {
  async function restoreToken() {
    const accessToken = await getAccessToken();
    
    if (accessToken) {
      try {
        const user = await authApi.me();
        dispatch({ type: 'RESTORE_TOKEN', accessToken, user });
      } catch {
        await clearTokens(); // Token expirado
      }
    }
    
    dispatch({ type: 'SET_LOADING', isLoading: false });
  }
  
  restoreToken();
}, []);
```

### 2. Login

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Tela Login │────▶│ POST /auth/  │────▶│ Salva       │
│  (email +   │     │    login     │     │ tokens no   │
│   senha)    │     │              │     │ SecureStore  │
└─────────────┘     └──────────────┘     └─────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────┐
                                          │ Dispatch    │
                                          │ LOGIN       │
                                          └─────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────┐
                                          │ Redirect    │
                                          │ para empresa│
                                          │ ou app      │
                                          └─────────────┘
```

### 3. Refresh Token

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ Requisição  │────▶│ 401 Response │────▶│ Interceptor │
│ com token   │     │              │     │ detecta 401 │
│ expirado    │     │              │     │             │
└─────────────┘     └──────────────┘     └─────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────┐
                                          │ POST        │
                                          │ /auth/      │
                                          │ refresh     │
                                          └─────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────┐
                                          │ Salva novos │
                                          │ tokens      │
                                          └─────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────┐
                                          │ Retry       │
                                          │ requisição  │
                                          │ original    │
                                          └─────────────┘
```

### 4. Logout

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ Usuário     │────▶│ clearTokens()│────▶│ Dispatch    │
│ clica       │     │ (SecureStore)│     │ LOGOUT      │
│ logout      │     │              │     │             │
└─────────────┘     └──────────────┘     └─────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────┐
                                          │ Redirect    │
                                          │ para login  │
                                          └─────────────┘
```

---

## Fluxo de Empresa

### 1. Seleção de Empresa

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ GET         │────▶│ Lista        │────▶│ Usuário     │
│ /auth/      │     │ empresas     │     │ seleciona   │
│ companies   │     │              │     │ empresa     │
└─────────────┘     └──────────────┘     └─────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────┐
                                          │ POST        │
                                          │ /auth/      │
                                          │ switch-     │
                                          │ company     │
                                          └─────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────┐
                                          │ Recebe novos │
                                          │ tokens com   │
                                          │ companyId    │
                                          └─────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────┐
                                          │ Limpa cache  │
                                          │ empresa      │
                                          │ anterior     │
                                          └─────────────┘
```

### 2. Isolamento de Cache

```typescript
// Cache do TanStack Query é isolado por companyId
// Exemplo: queryKey inclui companyId
useQuery({
  queryKey: ['clients', activeCompany?.id],
  queryFn: () => fetchClients(activeCompany?.id),
});
```

### 3. Troca de Empresa

```typescript
// No switchCompany
const switchCompany = async (companyId: string) => {
  // 1. Limpa cache da empresa anterior
  queryClient.clear();
  
  // 2. Chama API para trocar empresa
  const response = await authApi.switchCompany({ companyId });
  
  // 3. Salva novos tokens
  await saveTokens(response.accessToken, response.refreshToken);
  
  // 4. Atualiza estado
  setActiveCompany(company);
};
```

---

## Estado Global (Zustand Store)

### Store de Sessão (`useSessionStore`)

```typescript
interface SessionState {
  sessionStatus: 'initializing' | 'authenticated' | 'unauthenticated';
  currentUser: AuthUser | null;
  activeCompany: CompanyResult | null;
  permissions: string[];
  accessStatus: string | null;
  
  // Actions
  setSession: (user: AuthUser, company?: CompanyResult | null) => void;
  setUser: (user: AuthUser) => void;
  setActiveCompany: (company: CompanyResult | null) => void;
  setPermissions: (permissions: string[]) => void;
  setAccessStatus: (status: string | null) => void;
  clearSession: () => void;
}
```

### Estados da Sessão

```
┌─────────────────┐
│  initializing   │  ← App iniciando, verificando token
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ authenticated   │  ← Usuário logado, empresa selecionada
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ unauthenticated │  ← Não logado ou token expirado
└─────────────────┘
```

### Uso nos Componentes

```typescript
// Lendo estado
const { sessionStatus, currentUser, activeCompany } = useSessionStore();

// Atualizando estado
const { setSession, clearSession, setActiveCompany } = useSessionStore();

// Exemplo: setar sessão após login
setSession(user, company);
```

---

## Dados Remotos (TanStack Query)

> 📝 **PENDENTE:** Implementação completa do TanStack Query para dados remotos

### Configuração

```typescript
// app/_layout.tsx
const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <Stack />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
```

### Padrões de Uso

```typescript
// Fetching de dados
const { data, isLoading, error } = useQuery({
  queryKey: ['clients', companyId],
  queryFn: () => fetchClients(companyId),
  enabled: !!companyId, // Só busca se tiver empresa
});

// Mutations
const mutation = useMutation({
  mutationFn: createClient,
  onSuccess: () => {
    // Invalida cache para refetch
    queryClient.invalidateQueries({ queryKey: ['clients'] });
  },
});
```

### Isolamento por Empresa

```typescript
// queryKey sempre inclui companyId
queryKey: ['resource', companyId, resourceId]
```

---

## Próximos Passos

1. ✅ Arquitetura base definida
2. 🔄 Implementar completamente TanStack Query
3. 🔄 Criar hooks customizados para cada domínio
4. 🔄 Adicionar cache persistente para dados offline
5. 🔄 Implementar fila de mutações offline

---

**Documento:** ARCHITECTURE.md  
**Última atualização:** Agosto 2026  
**Projeto:** SmartGesso Mobile