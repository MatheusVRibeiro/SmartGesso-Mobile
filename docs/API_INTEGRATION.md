# Integração com API — SmartGesso Mobile

Documentação completa da integração do mobile com a API REST do SmartGesso.

---

## Índice

- [Visão Geral](#visão-geral)
- [Endpoints Consumidos](#endpoints-consumidos)
- [Contratos de Request/Response](#contratos-de-requestresponse)
- [Tratamento de Erros](#tratamento-de-erros)
- [Refresh Token Flow](#refresh-token-flow)
- [Fila de Requisições Durante Refresh](#fila-de-requisições-durante-refresh)
- [Cliente HTTP (Axios)](#cliente-http-axios)

---

## Visão Geral

O SmartGesso Mobile consome a API REST do SmartGesso-API via HTTPS.

### URL Base

```typescript
// src/constants/config.ts
export const config = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  apiTimeout: 30000, // 30 segundos
};
```

| Ambiente | URL |
|----------|-----|
| Desenvolvimento | `http://localhost:3000/api/v1` |
| Staging | [PENDENTE] |
| Produção | `https://[DOMINIO]/api/v1` |

### Formato de Comunicação

- **Protocolo:** HTTPS
- **Formato:** JSON
- **Autenticação:** Bearer Token (JWT)
- **Timeout:** 30 segundos

---

## Endpoints Consumidos

### Autenticação

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| POST | `/auth/login` | Login do usuário | ❌ Não |
| POST | `/auth/refresh` | Renovar access token | ❌ Não |
| GET | `/auth/me` | Dados do usuário autenticado | ✅ Sim |
| POST | `/auth/forgot-password` | Solicitar recuperação de senha | ❌ Não |
| POST | `/auth/reset-password` | Redefinir senha | ❌ Não |
| POST | `/auth/accept-invitation` | Aceitar convite | ❌ Não |

### Empresas

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/auth/companies` | Listar empresas do usuário | ✅ Sim |
| POST | `/auth/switch-company` | Trocar empresa ativa | ✅ Sim |

### Outros Endpoints (Futuros)

> 📝 **PENDENTE:** Documentar endpoints de clientes, orçamentos, serviços, etc. conforme implementação

---

## Contratos de Request/Response

### POST /auth/login

**Request:**
```typescript
interface LoginRequest {
  email: string;      // Email do usuário
  password: string;   // Senha do usuário
}
```

**Response (200):**
```typescript
interface LoginResponse {
  accessToken: string;    // Token de acesso (15 min)
  refreshToken: string;   // Token de renovação (30 dias)
  user: {
    id: string;           // ID do usuário
    name: string;         // Nome do usuário
    email: string;        // Email do usuário
    activeCompanyId: string | null;  // Empresa ativa (se tiver)
  };
}
```

**Exemplo:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "usr_123",
    "name": "Admin Master",
    "email": "a.mult@example.com",
    "activeCompanyId": "cmp_456"
  }
}
```

---

### POST /auth/refresh

**Request:**
```typescript
interface RefreshRequest {
  refreshToken: string;   // Token de renovação
}
```

**Response (200):**
```typescript
interface RefreshResponse {
  accessToken: string;    // Novo token de acesso
  refreshToken: string;   // Novo token de renovação (rotação)
}
```

**Exemplo:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...(novo)",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...(novo)"
}
```

> ⚠️ **Importante:** A cada refresh, ambos os tokens são rotacionados. O refresh token antigo é invalidado.

---

### GET /auth/me

**Request:**
```typescript
// Headers
Authorization: Bearer <accessToken>
```

**Response (200):**
```typescript
interface AuthMeResponse {
  id: string;              // ID do usuário
  name: string;            // Nome do usuário
  email: string;           // Email do usuário
  activeCompanyId: string | null;  // Empresa ativa
}
```

**Exemplo:**
```json
{
  "id": "usr_123",
  "name": "Admin Master",
  "email": "a.mult@example.com",
  "activeCompanyId": "cmp_456"
}
```

---

### POST /auth/forgot-password

**Request:**
```typescript
interface ForgotPasswordRequest {
  email: string;   // Email do usuário
}
```

**Response (200):**
```typescript
interface ForgotPasswordResponse {
  message: string;   // Mensagem de sucesso
}
```

**Exemplo:**
```json
{
  "message": "Se o email estiver cadastrado, você receberá um link de recuperação."
}
```

---

### POST /auth/reset-password

**Request:**
```typescript
interface ResetPasswordRequest {
  token: string;      // Token de recuperação (da URL)
  password: string;   // Nova senha
}
```

**Response (200):**
```typescript
interface ResetPasswordResponse {
  message: string;   // Mensagem de sucesso
}
```

**Exemplo:**
```json
{
  "message": "Senha redefinida com sucesso."
}
```

---

### POST /auth/accept-invitation

**Request:**
```typescript
interface AcceptInvitationRequest {
  token: string;      // Token do convite (da URL)
  password: string;   // Senha do novo usuário
}
```

**Response (200):**
```typescript
interface AcceptInvitationResponse {
  accessToken: string;     // Token de acesso
  refreshToken: string;    // Token de renovação
  user: {
    id: string;
    name: string;
    email: string;
  };
  companyId: string;       // Empresa do convite
}
```

**Exemplo:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "usr_789",
    "name": "Novo Usuário",
    "email": "novo@example.com"
  },
  "companyId": "cmp_456"
}
```

---

### GET /auth/companies

**Request:**
```typescript
// Headers
Authorization: Bearer <accessToken>
```

**Response (200):**
```typescript
interface CompaniesResponse {
  data: Array<{
    id: string;              // ID da empresa
    name: string;            // Nome da empresa
    slug: string;            // Slug da empresa
    logo?: string;           // URL do logo (opcional)
    isActive: boolean;       // Se está ativa
    accessStatus: string;    // Status de acesso
  }>;
}
```

**Exemplo:**
```json
{
  "data": [
    {
      "id": "cmp_456",
      "name": "Gesso & Cia",
      "slug": "gesso-cia",
      "logo": "https://...",
      "isActive": true,
      "accessStatus": "active"
    },
    {
      "id": "cmp_789",
      "name": "Drywall Express",
      "slug": "drywall-express",
      "isActive": true,
      "accessStatus": "active"
    }
  ]
}
```

---

### POST /auth/switch-company

**Request:**
```typescript
interface SwitchCompanyRequest {
  companyId: string;   // ID da empresa selecionada
}

// Headers
Authorization: Bearer <accessToken>
```

**Response (200):**
```typescript
interface SwitchCompanyResponse {
  accessToken: string;      // Novo token de acesso
  refreshToken: string;     // Novo token de renovação
  activeCompanyId: string;  // Empresa ativa
}
```

**Exemplo:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...(novo)",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...(novo)",
  "activeCompanyId": "cmp_789"
}
```

---

## Tratamento de Erros

### Formato de Erro da API

```typescript
interface ApiErrorResponse {
  message: string;                    // Mensagem principal
  code: ApiErrorCode;                 // Código do erro
  errors?: Record<string, string[]>;  // Erros de validação por campo
  details?: Record<string, unknown>;  // Detalhes extras
}
```

### Códigos de Erro

| Código | Status HTTP | Descrição |
|--------|-------------|-----------|
| `UNAUTHORIZED` | 401 | Token inválido ou expirado |
| `FORBIDDEN` | 403 | Acesso negado |
| `COMPANY_ACCESS_DENIED` | 403 | Empresa não autorizada |
| `COMPANY_ACCESS_SUSPENDED` | 402 | Empresa suspensa |
| `SUBSCRIPTION_GRACE_PERIOD` | 402 | Período de carência |
| `VALIDATION_ERROR` | 422 | Erro de validação |
| `RATE_LIMITED` | 429 | Limite de requisições |
| `NETWORK_ERROR` | — | Sem conexão ou timeout |
| `SERVER_ERROR` | 500+ | Erro interno do servidor |

### Tratamento por Código

```typescript
// src/services/api/client.ts
function mapStatusToErrorCode(status: number, body?: Record<string, unknown>): ApiErrorCode {
  // Se a API retornar um código específico, usar ele
  if (body && typeof body.code === 'string') {
    const known = ['COMPANY_ACCESS_DENIED', 'COMPANY_ACCESS_SUSPENDED', 'SUBSCRIPTION_GRACE_PERIOD'];
    if (known.includes(body.code)) {
      return body.code as ApiErrorCode;
    }
  }

  switch (status) {
    case 401: return 'UNAUTHORIZED';
    case 403: return 'FORBIDDEN';
    case 422: return 'VALIDATION_ERROR';
    case 429: return 'RATE_LIMITED';
    default: return status >= 500 ? 'SERVER_ERROR' : 'SERVER_ERROR';
  }
}
```

### Exemplos de Uso

```typescript
import { toApiError } from '@/services/api/client';

try {
  await api.post('/auth/login', { email, password });
} catch (error) {
  const apiError = toApiError(error);
  
  switch (apiError.code) {
    case 'UNAUTHORIZED':
      // Credenciais inválidas
      showError('Email ou senha incorretos');
      break;
      
    case 'COMPANY_ACCESS_SUSPENDED':
      // Empresa suspensa
      navigation.navigate('access-suspended');
      break;
      
    case 'VALIDATION_ERROR':
      // Erros de validação por campo
      if (apiError.errors) {
        Object.entries(apiError.errors).forEach(([field, messages]) => {
          setError(field, messages[0]);
        });
      }
      break;
      
    case 'NETWORK_ERROR':
      // Sem conexão
      showError('Verifique sua conexão com a internet');
      break;
      
    default:
      showError('Erro inesperado. Tente novamente.');
  }
}
```

---

## Refresh Token Flow

### Fluxo Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    REFRESH TOKEN FLOW                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Requisição com Access Token                               │
│      │                                                      │
│      ▼                                                      │
│  API Retorna 401 (Token Expirado)                         │
│      │                                                      │
│      ▼                                                      │
│  Interceptor Detecta 401                                   │
│      │                                                      │
│      ├─── Já está refreshando? ──── Sim ────▶ Enfileira   │
│      │                                          requisição  │
│      Não                                                    │
│      │                                                      │
│      ▼                                                      │
│  Marcar _retry = true                                     │
│      │                                                      │
│      ▼                                                      │
│  POST /auth/refresh (com Refresh Token)                   │
│      │                                                      │
│      ├─── Sucesso? ──── Não ────▶ Limpar tokens           │
│      │                            → Login                  │
│      Sim                                                    │
│      │                                                      │
│      ▼                                                      │
│  Salvar novos tokens (SecureStore)                        │
│      │                                                      │
│      ▼                                                      │
│  Processar fila de requisições                            │
│      │                                                      │
│      ▼                                                      │
│  Retry requisição original com novo token                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Implementação

```typescript
// src/services/api/client.ts

async function refreshTokens(): Promise<string> {
  const refreshToken = await SecureTokenStorage.getRefreshToken();
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  // Usar rawClient (sem interceptors) para evitar loop
  const response = await rawClient.post('/auth/refresh', { refreshToken });
  
  const { accessToken: newAccess, refreshToken: newRefresh } = response.data;
  
  await saveTokens(newAccess, newRefresh);
  return newAccess;
}

// Interceptor de resposta
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Já está refreshando? Enfileira
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return client.request(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshTokens();
        processQueue(null, newToken);
        
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return client.request(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await clearTokens();
        
        // Notificar app para limpar sessão
        if (unauthorizedHandler) {
          unauthorizedHandler();
        }
        
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
```

---

## Fila de Requisições Durante Refresh

### Por que é necessária?

Quando o access token expira, múltiplas requisições podem falhar simultaneamente. Em vez de fazer refresh para cada uma, enfileiramos e processamos uma vez.

### Fluxo

```
Requisição A ──▶ 401 ──▶ Inicia refresh ──▶ Salva na fila
Requisição B ──▶ 401 ──▶ Já refreshando ──▶ Salva na fila
Requisição C ──▶ 401 ──▶ Já refreshando ──▶ Salva na fila

Refresh completo ──▶ Processa fila:
  ├── Requisição A: resolve(token) ──▶ Retry com novo token
  ├── Requisição B: resolve(token) ──▶ Retry com novo token
  └── Requisição C: resolve(token) ──▶ Retry com novo token
```

### Implementação

```typescript
interface FailedRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

function processQueue(error: unknown, token: string | null = null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });
  failedQueue = [];
}

// Uso no interceptor
if (isRefreshing) {
  return new Promise<string>((resolve, reject) => {
    failedQueue.push({ resolve, reject });
  }).then((token) => {
    originalRequest.headers.Authorization = `Bearer ${token}`;
    return client.request(originalRequest);
  });
}
```

---

## Cliente HTTP (Axios)

### Configuração

```typescript
// src/services/api/client.ts

import axios, { AxiosInstance } from 'axios';
import { config } from '../../constants/config';

let client: AxiosInstance | null = null;

export function createApiClient(): AxiosInstance {
  if (client) return client;

  client = axios.create({
    baseURL: config.apiUrl,
    timeout: config.apiTimeout,
    headers: { 'Content-Type': 'application/json' },
  });

  // Request interceptor: injeta Bearer token
  client.interceptors.request.use(
    async (requestConfig) => {
      const token = await SecureTokenStorage.getAccessToken();
      if (token) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }
      return requestConfig;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor: 401 → refresh + retry
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      // ... lógica de refresh (acima)
    }
  );

  return client;
}

export function getApiClient(): AxiosInstance {
  if (!client) {
    return createApiClient();
  }
  return client;
}
```

### Uso nos Serviços

```typescript
// src/services/api/auth.ts

import { getApiClient } from './client';

export const authApi = {
  login: async (data: LoginRequest) => {
    const client = getApiClient();
    const response = await client.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  me: async () => {
    const client = getApiClient();
    const response = await client.get<AuthMeResponse>('/auth/me');
    return response.data;
  },

  // ... outros métodos
};
```

### Handler de Unauthorized

```typescript
// Registrar handler para limpar sessão
export function setUnauthorizedHandler(handler: () => void): void {
  unauthorizedHandler = handler;
}

// Usar no App
useEffect(() => {
  setUnauthorizedHandler(() => {
    clearSession(); // Zustand store
  });
}, []);
```

---

## Validação de Dados

### Com Zod

```typescript
// src/validation/schemas.ts

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

// Uso
const result = loginSchema.safeParse({ email, password });
if (!result.success) {
  // Tratar erros de validação
  result.error.errors.forEach(err => {
    setError(err.path[0], err.message);
  });
}
```

---

## Cancelamento de Requisições

### AbortController

```typescript
import { useEffect, useState } from 'react';

function useClients(companyId: string) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchClients() {
      try {
        const response = await getApiClient().get('/clients', {
          params: { companyId },
          signal: controller.signal,
        });
        setClients(response.data);
      } catch (error) {
        if (error.name !== 'AbortError') {
          // Tratar erro
        }
      } finally {
        setLoading(false);
      }
    }

    fetchClients();

    return () => controller.abort();
  }, [companyId]);

  return { clients, loading };
}
```

---

## Logs e Debug

### Habilitar Logs (Desenvolvimento)

```typescript
// Em desenvolvimento, logar requisições
if (__DEV__) {
  client.interceptors.request.use((config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  });

  client.interceptors.response.use(
    (response) => {
      console.log(`[API] ${response.status} ${response.config.url}`);
      return response;
    },
    (error) => {
      console.error(`[API] Error:`, error);
      return Promise.reject(error);
    }
  );
}
```

> ⚠️ **Nunca** logar tokens ou dados sensíveis em produção!

---

## Próximos Passos

1. ✅ Cliente HTTP configurado
2. ✅ Fluxo de refresh implementado
3. ✅ Fila de requisições implementada
4. 🔄 Gerar tipos a partir do OpenAPI
5. 🔄 Implementar hooks de dados com TanStack Query
6. 🔄 Adicionar retry configurável
7. 🔄 Implementar cache offline

---

**Documento:** API_INTEGRATION.md  
**Última atualização:** Agosto 2026  
**Projeto:** SmartGesso Mobile