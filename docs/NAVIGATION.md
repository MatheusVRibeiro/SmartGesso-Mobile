# Navegação — SmartGesso Mobile

Documentação completa do sistema de navegação do aplicativo.

---

## Índice

- [Mapa de Rotas](#mapa-de-rotas)
- [Estados de Navegação](#estados-de-navegação)
- [Fluxo de Autenticação](#fluxo-de-autenticação)
- [Deep Links](#deep-links)

---

## Mapa de Rotas

O Expo Router organiza as rotas em grupos baseados no estado de autenticação:

```
app/
├── (auth)/                          # Grupo: Não autenticado
│   ├── _layout.tsx                 # Stack sem header
│   ├── login.tsx                   # /login
│   ├── forgot-password.tsx         # /forgot-password
│   ├── reset-password.tsx          # /reset-password?token=xxx
│   └── accept-invitation.tsx       # /accept-invitation?token=xxx
│
├── (company)/                       # Grupo: Seleção de empresa
│   ├── _layout.tsx                 # Stack sem header
│   ├── select-company.tsx          # /select-company
│   ├── company-profile.tsx         # /company-profile
│   └── access-suspended.tsx        # /access-suspended
│
├── (app)/                           # Grupo: Autenticado (app principal)
│   ├── _layout.tsx                 # Stack com header
│   ├── profile.tsx                 # /profile
│   └── (tabs)/                     # Abas principais
│       ├── _layout.tsx             # Tab navigator
│       ├── index.tsx               # / (Dashboard)
│       ├── orcamentos.tsx          # /orcamentos
│       ├── servicos.tsx            # /servicos
│       ├── novo.tsx                # /novo
│       └── mais.tsx                # /mais
│
├── _layout.tsx                      # Layout raiz (QueryClient + SafeArea)
├── index.tsx                        # Entry point (redireciona)
└── +not-found.tsx                   # 404
```

### URLs Resultantes

| Rota | URL | Descrição |
|------|-----|-----------|
| Login | `/login` | Tela de login |
| Esqueci senha | `/forgot-password` | Solicitar recuperação |
| Redefinir senha | `/reset-password?token=xxx` | Redefinir senha |
| Aceitar convite | `/accept-invitation?token=xxx` | Aceitar convite |
| Selecionar empresa | `/select-company` | Lista de empresas |
| Perfil empresa | `/company-profile` | Detalhes da empresa |
| Acesso suspenso | `/access-suspended` | Empresa suspensa |
| Dashboard | `/` (tabs) | Tela principal |
| Orçamentos | `/orcamentos` | Lista de orçamentos |
| Serviços | `/servicos` | Lista de serviços |
| Novo | `/novo` | Criar novo item |
| Mais | `/mais` | Mais opções |
| Perfil | `/profile` | Perfil do usuário |

---

## Estados de Navegação

O app possui 3 estados principais de navegação:

```
┌─────────────────────────────────────────────────────────────┐
│                    ESTADOS DE NAVEGAÇÃO                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐                                        │
│  │  initializing   │  ← App carregando, verificando token  │
│  └────────┬────────┘                                        │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │ authenticated   │  ← Usuário logado                     │
│  └────────┬────────┘                                        │
│           │                                                 │
│           ├─── Tem empresa ativa? ──────┬─── Sim ──────┐   │
│           │                             │              │   │
│           │                             ▼              │   │
│           │                    ┌─────────────────┐     │   │
│           │                    │    (app) tabs   │     │   │
│           │                    └─────────────────┘     │   │
│           │                                            │   │
│           │                             Não            │   │
│           │                                            │   │
│           │                             ▼              │   │
│           │                    ┌─────────────────┐     │   │
│           │                    │ (company)       │     │   │
│           │                    │ select-company  │     │   │
│           │                    └─────────────────┘     │   │
│           │                                            │   │
│           ▼                                            │   │
│  ┌─────────────────┐                                   │   │
│  │ unauthenticated │  ← Não logado                     │   │
│  └────────┬────────┘                                   │   │
│           │                                            │   │
│           ▼                                            │   │
│  ┌─────────────────┐                                   │   │
│  │    (auth)       │                                   │   │
│  │    login        │                                   │   │
│  └─────────────────┘                                   │   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1. Inicializando (`initializing`)

- App acabou de iniciar
- Verificando se existe token no SecureStore
- Se existir → valida com API (`GET /auth/me`)
- Se válido → `authenticated`
- Se inválido → `unauthenticated`
- **Mostra:** Splash screen ou loading

### 2. Autenticado (`authenticated`)

- Usuário está logado
- **Tem empresa ativa?**
  - **Sim:** Navega para `(app)` (tabs)
  - **Não:** Navega para `(company)` (select-company)
- **Mostra:** Interface principal do app

### 3. Não Autenticado (`unauthenticated`)

- Usuário não está logado OU token expirado
- **Mostra:** Tela de login `(auth)`

---

## Fluxo de Autenticação

### Fluxo Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO DE AUTENTICAÇÃO                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  App Inicia                                                 │
│      │                                                      │
│      ▼                                                      │
│  Verificar Token (SecureStore)                             │
│      │                                                      │
│      ├─── Token existe? ──────── Não ──────▶ login.tsx     │
│      │                                                      │
│      Sim                                                    │
│      │                                                      │
│      ▼                                                      │
│  Validar com API (GET /auth/me)                            │
│      │                                                      │
│      ├─── Válido? ──────────── Não ──────▶ login.tsx      │
│      │                                   (limpa token)     │
│      Sim                                                    │
│      │                                                      │
│      ▼                                                      │
│  Restaurar Sessão (dispatch RESTORE_TOKEN)                 │
│      │                                                      │
│      ▼                                                      │
│  Verificar Empresa Ativa                                   │
│      │                                                      │
│      ├─── Tem empresa? ──── Não ──────▶ select-company.tsx │
│      │                                                      │
│      Sim                                                    │
│      │                                                      │
│      ▼                                                      │
│  Navegar para (app) tabs                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Login

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  login.tsx  │────▶│ POST /auth/  │────▶│ Salvar      │
│  (email +   │     │    login     │     │ tokens      │
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
                                          │ Verificar   │
                                          │ empresa     │
                                          └─────────────┘
                                                   │
                                    ┌──────────────┴──────────────┐
                                    │                             │
                                    ▼                             ▼
                           ┌─────────────┐               ┌─────────────┐
                           │ select-     │               │ (app) tabs  │
                           │ company     │               │             │
                           └─────────────┘               └─────────────┘
```

### Seleção de Empresa

```
┌───────────────────┐     ┌──────────────┐     ┌─────────────┐
│ select-company.tsx│────▶│ GET /auth/   │────▶│ Lista       │
│                   │     │ companies    │     │ empresas    │
└───────────────────┘     └──────────────┘     └─────────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────┐
                                                 │ Usuário     │
                                                 │ seleciona   │
                                                 └─────────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────┐
                                                 │ POST /auth/ │
                                                 │ switch-     │
                                                 │ company     │
                                                 └─────────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────┐
                                                 │ Salvar      │
                                                 │ novos       │
                                                 │ tokens      │
                                                 └─────────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────┐
                                                 │ Limpar      │
                                                 │ cache       │
                                                 │ empresa     │
                                                 │ anterior    │
                                                 └─────────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────┐
                                                 │ Navegar     │
                                                 │ para        │
                                                 │ (app) tabs  │
                                                 └─────────────┘
```

### Logout

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Profile    │────▶│ clearTokens()│────▶│ Dispatch    │
│  ou Menu    │     │ (SecureStore)│     │ LOGOUT      │
│  (logout)   │     │              │     │             │
└─────────────┘     └──────────────┘     └─────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────┐
                                          │ Limpar      │
                                          │ cache       │
                                          │ (queryClient│
                                          │  .clear())  │
                                          └─────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────┐
                                          │ Navegar     │
                                          │ para login  │
                                          └─────────────┘
```

---

## Deep Links

O app suporta deep links com o scheme `smartgesso://`.

### Scheme Configurado

```typescript
// app.config.ts
const config: ExpoConfig = {
  scheme: 'smartgesso',
  // ...
};
```

### Deep Links Suportados

| Deep Link | Descrição |
|-----------|-----------|
| `smartgesso://login` | Tela de login |
| `smartgesso://select-company` | Seleção de empresa |
| `smartgesso://reset-password?token=xxx` | Redefinir senha |
| `smartgesso://accept-invitation?token=xxx` | Aceitar convite |

### Uso

```typescript
import * as Linking from 'expo-linking';

// Abrir deep link
Linking.openURL('smartgesso://login');

// Escutar deep links
useEffect(() => {
  const subscription = Linking.addEventListener('url', ({ url }) => {
    // Processar deep link
    const parsed = Linking.parse(url);
    // parsed.pathname = '/reset-password'
    // parsed.queryParams = { token: 'xxx' }
  });

  return () => subscription.remove();
}, []);
```

### Validação

```typescript
// Validar deep link antes de processar
const isValidDeepLink = (url: string): boolean => {
  const parsed = Linking.parse(url);
  
  // Verificar se é do nosso scheme
  if (parsed.scheme !== 'smartgesso') return false;
  
  // Verificar rotas válidas
  const validRoutes = ['/login', '/select-company', '/reset-password', '/accept-invitation'];
  return validRoutes.includes(parsed.pathname ?? '');
};
```

---

## Navegação entre Telas

### Usando Expo Router

```typescript
import { router } from 'expo-router';

// Navegar para rota
router.push('/orcamentos');

// Navegar com parâmetros
router.push({
  pathname: '/orcamento/[id]',
  params: { id: '123' },
});

// Substituir tela atual
router.replace('/login');

// Voltar
router.back();

// Navegar para raiz
router.dismissAll();
```

### Links em Componentes

```typescript
import { Link } from 'expo-router';

<Link href="/orcamentos">Ver Orçamentos</Link>

<Link
  href={{
    pathname: '/orcamento/[id]',
    params: { id: '123' }}
  }}
>
  Ver Orçamento #123
</Link>
```

---

## Rotas Protegidas

### Lógica de Proteção

```typescript
// app/_layout.tsx ou auth context
const { sessionStatus } = useSessionStore();

// Enquanto inicializando, mostra loading
if (sessionStatus === 'initializing') {
  return <LoadingScreen />;
}

// Se não autenticado, redireciona para login
if (sessionStatus === 'unauthenticated') {
  return <Redirect href="/login" />;
}

// Se autenticado, mostra o app
return <Stack />;
```

### Verificação de Permissão

```typescript
import { PermissionGate } from '@/components/ui';

// Verificar permissão antes de renderizar
<PermissionGate permission="clients.create">
  <Button onPress={createClient}>Novo Cliente</Button>
</PermissionGate>
```

---

## Fluxo de Erros

### Token Expirado

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ Requisição  │────▶│ 401 Response │────▶│ Interceptor │
│ API         │     │              │     │ detecta 401 │
└─────────────┘     └──────────────┘     └─────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────┐
                                          │ POST        │
                                          │ /auth/      │
                                          │ refresh     │
                                          └─────────────┘
                                                   │
                                    ┌──────────────┴──────────────┐
                                    │                             │
                                    ▼                             ▼
                           ┌─────────────┐               ┌─────────────┐
                           │ Sucesso     │               │ Falha       │
                           │ Retry       │               │ Limpar      │
                           │ requisição  │               │ tokens      │
                           └─────────────┘               └─────────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────┐
                                                 │ Navegar     │
                                                 │ para login  │
                                                 └─────────────┘
```

### Acesso Suspenso (402)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ Requisição  │────▶│ 402 Response │────▶│ Navegar     │
│ API         │     │ (empresa     │     │ para        │
│             │     │  suspensa)   │     │ access-     │
└─────────────┘     └──────────────┘     │ suspended   │
                                         └─────────────┘
```

---

## Resumo dos Grupos de Rotas

| Grupo | Autenticação | Empresa | Descrição |
|-------|--------------|---------|-----------|
| `(auth)` | ❌ Não | ❌ Não | Rotas públicas (login, recuperação) |
| `(company)` | ✅ Sim | ❌ Não | Seleção de empresa |
| `(app)` | ✅ Sim | ✅ Sim | App principal (tabs) |

---

## Próximos Passos

1. ✅ Estrutura de rotas definida
2. 🔄 Implementar deep links completos
3. 🔄 Adicionar animações de transição
4. 🔄 Implementar históricos de navegação
5. 🔄 Adicionar suporte a notificações push (navegação)

---

**Documento:** NAVIGATION.md  
**Última atualização:** Agosto 2026  
**Projeto:** SmartGesso Mobile