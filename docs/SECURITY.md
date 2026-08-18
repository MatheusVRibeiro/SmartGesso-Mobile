# Segurança — SmartGesso Mobile

Documentação completa das práticas de segurança implementadas no aplicativo.

---

## Índice

- [Visão Geral](#visão-geral)
- [Armazenamento de Tokens](#armazenamento-de-tokens)
- [Multiempresa: Cache Isolado](#multiempresa-cache-isolado)
- [JWT: Access + Refresh Tokens](#jwt-access--refresh-tokens)
- [Reuso de Refresh Token](#reuso-de-refresh-token)
- [Dados Sensíveis](#dados-sensíveis)
- [Checklist de Segurança](#checklist-de-segurança)

---

## Visão Geral

O SmartGesso Mobile é um aplicativo operacional que acessa dados sensíveis de empresas. A segurança é tratada em múltiplas camadas:

1. **Armazenamento seguro** — Tokens nunca ficam expostos
2. **Autenticação robusta** — JWT com rotação de refresh token
3. **Isolamento de dados** — Cache isolado por empresa
4. **Proteção em trânsito** — HTTPS obrigatório
5. **Validação de entrada** — Zod para todos os dados externos

---

## Armazenamento de Tokens

### Expo SecureStore

O app utiliza **Expo SecureStore** para armazenar tokens e dados sensíveis.

```typescript
// src/services/auth/SecureTokenStorage.ts

import * as SecureStore from 'expo-secure-store';

export const SecureTokenStorage = {
  // Access Token
  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync('accessToken');
  },

  async setAccessToken(token: string): Promise<void> {
    await SecureStore.setItemAsync('accessToken', token);
  },

  // Refresh Token
  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync('refreshToken');
  },

  async setRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync('refreshToken', token);
  },

  // Limpar tudo
  async clearTokens(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync('accessToken'),
      SecureStore.deleteItemAsync('refreshToken'),
    ]);
  },
};
```

### Por que SecureStore?

| Feature | SecureStore | AsyncStorage |
|---------|-------------|--------------|
| Criptografia | ✅ AES-256 | ❌ Não |
| Armazenamento seguro | ✅ Keychain/Keystore | ❌ SQLite |
| Tokens | ✅ Recomendado | ❌ Nunca |
| Dados sensíveis | ✅ Recomendado | ❌ Nunca |
| Dados não sensíveis | ⚠️ Pode usar | ✅ OK |

### Regras

- ✅ **USAR** SecureStore para:
  - Access token
  - Refresh token
  - Dados pequenos e sensíveis de sessão

- ❌ **NUNCA** usar AsyncStorage para:
  - Tokens
  - Credenciais
  - Dados sensíveis

- ⚠️ **PODE** usar AsyncStorage para (futuro):
  - Preferências não sensíveis
  - Rascunhos simples
  - Cache de UI

---

## Multiempresa: Cache Isolado

### Isolamento por Empresa

O cache do TanStack Query é isolado por `companyId` para evitar vazamento de dados entre empresas.

```typescript
// Padrão: queryKey sempre inclui companyId
useQuery({
  queryKey: ['clients', activeCompany?.id],
  queryFn: () => fetchClients(activeCompany?.id),
  enabled: !!activeCompany?.id,
});
```

### Troca de Empresa

Quando o usuário troca de empresa, o cache da empresa anterior é limpo:

```typescript
const switchCompany = async (companyId: string) => {
  // 1. Limpar cache da empresa anterior
  queryClient.clear();

  // 2. Chamar API para trocar empresa
  const response = await authApi.switchCompany({ companyId });

  // 3. Salvar novos tokens
  await saveTokens(response.accessToken, response.refreshToken);

  // 4. Atualizar estado
  setActiveCompany(company);
};
```

### Fluxo de Segurança na Troca

```
┌─────────────────────────────────────────────────────────────┐
│                    TROCA DE EMPRESA                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Usuário seleciona nova empresa                           │
│      │                                                      │
│      ▼                                                      │
│  Limpar cache (queryClient.clear())                        │
│      │  ← REMOVE dados da empresa anterior                │
│      ▼                                                      │
│  POST /auth/switch-company                                 │
│      │  ← Recebe novos tokens com companyId               │
│      ▼                                                      │
│  Salvar novos tokens (SecureStore)                         │
│      │  ← Substitui tokens antigos                         │
│      ▼                                                      │
│  Atualizar Zustand store                                   │
│      │  ← Atualiza activeCompany                          │
│      ▼                                                      │
│  Navegar para (app) tabs                                   │
│      │  ← Cache vazio, dados serão buscados da empresa    │
│      │       nova                                          │
│      ▼                                                      │
│  TanStack Query busca dados da nova empresa               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Validação de Empresa

```typescript
// NUNCA confiar em companyId do body da requisição
// SEMPRE usar companyId do contexto de autenticação

// ❌ ERRADO
const companyId = req.body.companyId;

// ✅ CORRETO
const companyId = user.activeCompanyId;
```

---

## JWT: Access + Refresh Tokens

### Tipos de Token

| Token | Validade | Uso | Armazenamento |
|-------|----------|-----|---------------|
| Access Token | 15 minutos | Autenticar requisições | SecureStore (memória) |
| Refresh Token | 30 dias | Renovar access token | SecureStore (persistente) |

### Estrutura do Token

```typescript
// Access Token (JWT)
interface AccessTokenPayload {
  sub: string;        // ID do usuário
  email: string;      // Email do usuário
  companyId: string;  // Empresa ativa
  permissions: string[];  // Permissões
  iat: number;        // Data de emissão
  exp: number;        // Data de expiração (15 min)
}

// Refresh Token (JWT)
interface RefreshTokenPayload {
  sub: string;        // ID do usuário
  tokenId: string;    // ID único do token (para revogação)
  iat: number;        // Data de emissão
  exp: number;        // Data de expiração (30 dias)
}
```

### Fluxo de Autenticação

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO JWT                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Login                                                      │
│      │                                                      │
│      ▼                                                      │
│  POST /auth/login                                          │
│      │                                                      │
│      ▼                                                      │
│  Receber:                                                  │
│  ├── accessToken (15 min)                                  │
│  └── refreshToken (30 dias)                                │
│      │                                                      │
│      ▼                                                      │
│  Salvar em SecureStore                                     │
│      │                                                      │
│      ▼                                                      │
│  Requisições usam: Authorization: Bearer <accessToken>     │
│      │                                                      │
│      ▼                                                      │
│  Após 15 min → 401 → Refresh                              │
│      │                                                      │
│      ▼                                                      │
│  POST /auth/refresh                                        │
│      │                                                      │
│      ▼                                                      │
│  Receber NOVOS tokens:                                     │
│  ├── accessToken (novo, 15 min)                            │
│  └── refreshToken (novo, 30 dias)                          │
│      │                                                      │
│      ▼                                                      │
│  Salvar novos tokens (substitui antigos)                   │
│      │                                                      │
│      ▼                                                      │
│  Retry requisição original                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Expiração

```typescript
// Calculando tempo restante
const getTimeUntilExpiry = (token: string): number => {
  const payload = JSON.parse(atob(token.split('.')[1]));
  const expiresAt = payload.exp * 1000; // ms
  return expiresAt - Date.now();
};

// Verificar se está próximo de expirar (5 min)
const isNearExpiry = (token: string): boolean => {
  return getTimeUntilExpiry(token) < 5 * 60 * 1000;
};
```

---

## Reuso de Refresh Token

### O que acontece?

Quando o refresh token é reutilizado (após já ter sido usado), **todas as sessões anteriores são revogadas**.

### Por que?

Isso é uma medida de segurança para:
1. **Detectar roubo de token** — Se alguém roubou o refresh token e o usou, a sessão legítima é invalidada
2. **Forçar re-login** — Usuário precisa se autenticar novamente
3. **Limpar dispositivos** — Sessões em dispositivos antigos são invalidadas

### Fluxo

```
┌─────────────────────────────────────────────────────────────┐
│                REUSO DE REFRESH TOKEN                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Dispositivo A: usa refresh token #1                       │
│      │                                                      │
│      ▼                                                      │
│  Recebe novos tokens (refresh token #2)                    │
│      │                                                      │
│      ▼                                                      │
│  Dispositivo B: usa refresh token #1 (já used)             │
│      │                                                      │
│      ▼                                                      │
│  API detecta reuso                                         │
│      │                                                      │
│      ▼                                                      │
│  REVOGAR TODAS as sessões do usuário                       │
│      │                                                      │
│      ▼                                                      │
│  Dispositivo A: próximo refresh → 401 → Login              │
│  Dispositivo B: já recebe 401 → Login                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Implementação no Mobile

```typescript
// O mobile não precisa de lógica especial
// A API já trata a revogação

// Se receber 401 durante refresh:
try {
  const newToken = await refreshTokens();
  // Sucesso
} catch (error) {
  // Refresh falhou (token revogado ou expirado)
  await clearTokens();
  clearSession(); // Zustand
  // Navegar para login
}
```

### Boas Práticas

1. **Nunca armazenar refresh token em múltiplos dispositivos** — Usar um só
2. **Implementar logout em todos os dispositivos** — Opção no perfil
3. **Notificar usuário** — "Sessão encerrada em outro dispositivo"

---

## Dados Sensíveis

### O que são dados sensíveis?

- Tokens (access e refresh)
- Credenciais (email + senha)
- Dados financeiros
- Dados de clientes
- Informações de pagamento

### Regras de Proteção

#### 1. NUNCA em Logs

```typescript
// ❌ ERRADO
console.log('Login:', { email, password, token });

// ✅ CORRETO
console.log('Login:', { email });
// ou
console.log('Login realizado com sucesso');
```

#### 2. NUNCA em URLs

```typescript
// ❌ ERRADO
const url = `/api/v1/clients?token=${accessToken}`;

// ✅ CORRETO
const url = '/api/v1/clients';
// Token vai no header: Authorization: Bearer <token>
```

#### 3. NUNCA em Analytics

```typescript
// ❌ ERRADO
analytics.track('login', { email, password });

// ✅ CORRETO
analytics.track('login');
```

#### 4. NUNCA em Deep Links

```typescript
// ❌ ERRADO
Linking.openURL(`smartgesso://reset-password?token=${resetToken}`);

// ✅ CORRETO (token é curto e temporário, mas evitar expor)
// Usar apenas se necessário
Linking.openURL(`smartgesso://reset-password?token=${resetToken}`);
// Reset token é de uso único e expira rapidamente
```

#### 5. NUNCA no Código

```typescript
// ❌ ERRADO
const API_KEY = 'sk_live_1234567890';

// ✅ CORRETO
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;
```

### Checklist de Proteção

| Item | Status |
|------|--------|
| Tokens no SecureStore | ✅ |
| Nenhum token em log | ✅ |
| Nenhuma credencial no código | ✅ |
| Cache isolado por empresa | ✅ |
| Deep links validados | ✅ |
| Dados não em URLs | ✅ |
| Dados não em analytics | ✅ |
| HTTPS obrigatório | ✅ |

---

## Checklist de Segurança

### Pré-Commit

- [ ] Nenhum token em console.log
- [ ] Nenhum token em URLs
- [ ] Nenhuma credencial no código
- [ ] SecureStore para tokens
- [ ] Cache isolado por empresa
- [ ] Validação Zod em dados externos
- [ ] Tratamento de erros 401/402/403
- [ ] Limpeza de cache no logout

### Pré-Release

- [ ] Revisão de segurança completa
- [ ] Testes de autenticação
- [ ] Testes de troca de empresa
- [ ] Testes de token expirado
- [ ] Testes de refresh token
- [ ] Validação de deep links
- [ ] Verificação de logs sensíveis
- [ ] Análise de dependências

### Produção

- [ ] HTTPS obrigatório
- [ ] Certificados válidos
- [ ] Rate limiting na API
- [ ] Monitoramento de erros
- [ ] Logs sem dados sensíveis
- [ ] Backup de dados
- [ ] Plano de recuperação

---

## Vulnerabilidades Conhecidas

### 1. Token no AsyncStorage

**Status:** ✅ Mitigado

O app usa SecureStore, não AsyncStorage.

### 2. Token em Logs

**Status:** ✅ Mitigado

Logs não incluem tokens. Usar apenas em desenvolvimento com `__DEV__`.

### 3. Vazamento entre Empresas

**Status:** ✅ Mitigado

Cache isolado por companyId. Troca de empresa limpa cache.

### 4. Refresh Token Roubado

**Status:** ✅ Mitigado

Reuso de refresh token revoga todas as sessões.

### 5. Deep Link Malicioso

**Status:** ⚠️ Parcialmente mitigado

Validação de deep links implementada. Melhorar validação de tokens em URLs.

---

## Ferramentas de Segurança

### ESLint Plugins

```json
{
  "plugins": ["security"]
}
```

### Dependabot

Configurar para monitorar dependências com vulnerabilidades.

### Snyk

Integrar para análise estática de segurança.

---

## Próximos Passos

1. ✅ Armazenamento seguro configurado
2. ✅ Cache isolado implementado
3. ✅ Fluxo JWT documentado
4. 🔄 Implementar biometria (Face ID / Fingerprint)
5. 🔄 Adicionar certificate pinning
6. 🔄 Implementar anti-tampering
7. 🔄 Adicionar remote wipe
8. 🔄 Auditoria de segurança externa

---

**Documento:** SECURITY.md  
**Última atualização:** Agosto 2026  
**Projeto:** SmartGesso Mobile