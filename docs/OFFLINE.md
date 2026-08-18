# Offline First — SmartGesso Mobile

Documentação da estratégia de funcionamento offline e com internet instável.

---

## Índice

- [Visão Geral](#visão-geral)
- [Fase 1: Detecção e Feedback](#fase-1-detecção-e-feedback)
- [Fase 2: Rascunhos Locais e Sincronização](#fase-2-rascunhos-locais-e-sincronização)
- [Princípios](#princípios)

---

## Visão Geral

O SmartGesso Mobile precisa funcionar em ambientes com internet instável, como obras e canteiros de obras. A estratégia é dividida em duas fases:

```
┌─────────────────────────────────────────────────────────────┐
│                    ESTRATÉGIA OFFLINE                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FASE 1 (ATUAL)                                            │
│  ├── Detecção de conexão                                   │
│  ├── Banner informativo                                    │
│  ├── Formulários preservados                               │
│  ├── Tratamento de erros de rede                           │
│  └── Retry manual                                          │
│                                                             │
│  FASE 2 (FUTURO)                                           │
│  ├── Rascunhos locais (SQLite)                             │
│  ├── Fila de sincronização                                 │
│  ├── Upload pendente                                       │
│  ├── Indicador de sincronização                            │
│  ├── Resolução de conflitos                                │
│  └── Idempotência                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Fase 1: Detecção e Feedback

### Estado Atual

A Fase 1 está implementada e inclui:

#### 1. Detecção de Conexão

```typescript
// Expo Network
import * as Network from 'expo-network';

const isConnected = await Network.getNetworkStateAsync();
```

#### 2. Banner Offline

```typescript
// src/components/ui/OfflineBanner.tsx
// Exibe banner quando offline
```

#### 3. Preservação de Formulários

- Dados de formulários são preservados localmente
- Usuário pode continuar preenchendo offline
- Dados são enviados quando a conexão voltar

#### 4. Tratamento de Erros de Rede

```typescript
// src/services/api/client.ts
function mapStatusToErrorCode(status: number, body?: Record<string, unknown>): ApiErrorCode {
  if (!axios.isAxiosError(error) || !error.response) {
    const message = axiosErr?.code === 'ECONNABORTED'
      ? 'Tempo limite de conexão excedido'
      : 'Erro de rede — verifique sua conexão';
    return { message, code: 'NETWORK_ERROR' };
  }
  // ...
}
```

#### 5. Retry Manual

- Botão "Tentar novamente" em telas de erro
- Retry automático em requisições específicas

### Fluxo Fase 1

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO FASE 1                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Usuário preenche formulário                               │
│      │                                                      │
│      ├─── Online? ──── Sim ────▶ Enviar para API           │
│      │                                                      │
│      Não                                                    │
│      │                                                      │
│      ▼                                                      │
│  Mostrar banner "Sem conexão"                              │
│      │                                                      │
│      ▼                                                      │
│  Dados preservados no formulário                           │
│      │                                                      │
│      ▼                                                      │
│  Usuário clica "Tentar novamente"                          │
│      │                                                      │
│      ▼                                                      │
│  Verificar conexão                                         │
│      │                                                      │
│      ├─── Online? ──── Sim ────▶ Enviar para API           │
│      │                                                      │
│      Não                                                    │
│      │                                                      │
│      ▼                                                      │
│  Manter dados e banner                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Fase 2: Rascunhos Locais e Sincronização

> 📝 **PENDENTE:** Implementação completa da Fase 2

### Visão Geral

A Fase 2 implementará armazenamento local completo com sincronização automática.

### Tecnologias

- **Expo SQLite** — Armazenamento local estruturado
- **Fila de Sincronização** — Enfileirar mutações offline
- **Resolução de Conflitos** — Lidar com dados modificados offline e online

### Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    FASE 2: OFFLINE FULL                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    UI Layer                          │  │
│  │  (Componentes React Native)                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│                           ▼                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                 Hooks de Dados                       │  │
│  │  (useQuery, useMutation)                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│                           ▼                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Cache Layer (TanStack Query)            │  │
│  │  ├── Memória (RAM)                                  │  │
│  │  └── Persistência (SQLite)                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│                           ▼                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Sync Queue (SQLite)                     │  │
│  │  ├── Mutations pendentes                            │  │
│  │  ├── Status (pending/synced/error)                  │  │
│  │  └── Timestamps                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│                           ▼                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Network Layer (Axios)                   │  │
│  │  ├── Detecção de conexão                            │  │
│  │  ├── Retry automático                               │  │
│  │  └── Exponential backoff                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│                           ▼                                 │
│                    SmartGesso API                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Rascunhos Locais

#### Estrutura SQLite

```sql
-- Tabela de rascunhos
CREATE TABLE drafts (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,  -- 'client', 'order', 'measurement', etc.
  entity_id TEXT,             -- ID no servidor (null se novo)
  data TEXT NOT NULL,         -- JSON com dados do rascunho
  company_id TEXT NOT NULL,   -- Empresa (isolamento)
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  sync_status TEXT DEFAULT 'pending'  -- pending, synced, error
);

-- Tabela de fila de sincronização
CREATE TABLE sync_queue (
  id TEXT PRIMARY KEY,
  operation TEXT NOT NULL,    -- 'create', 'update', 'delete'
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  payload TEXT NOT NULL,      -- JSON com dados para enviar
  company_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  attempts INTEGER DEFAULT 0,
  last_error TEXT,
  status TEXT DEFAULT 'pending'  -- pending, syncing, synced, error
);
```

#### Uso

```typescript
// Criar rascunho
const draft = await SQLite.createDraft({
  entityType: 'client',
  data: { name: 'João', email: 'joao@email.com' },
  companyId: activeCompany.id,
});

// Enviar quando online
await SyncQueue.enqueue({
  operation: 'create',
  entityType: 'client',
  payload: draft.data,
  companyId: activeCompany.id,
});

// Deletar rascunho após sincronização
await SQLite.deleteDraft(draft.id);
```

### Fila de Sincronização

#### Estrutura

```typescript
interface SyncItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  entityType: string;
  entityId?: string;
  payload: Record<string, unknown>;
  companyId: string;
  createdAt: number;
  attempts: number;
  lastError?: string;
  status: 'pending' | 'syncing' | 'synced' | 'error';
}
```

#### Fluxo

```
┌─────────────────────────────────────────────────────────────┐
│                    SYNC QUEUE FLOW                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Mutação offline                                           │
│      │                                                      │
│      ▼                                                      │
│  Salvar na fila (SQLite)                                   │
│      │                                                      │
│      ▼                                                      │
│  Verificar conexão                                         │
│      │                                                      │
│      ├─── Online? ──── Sim ────▶ Processar fila           │
│      │                                                      │
│      Não                                                    │
│      │                                                      │
│      ▼                                                      │
│  Aguardar conexão                                          │
│      │                                                      │
│      ▼                                                      │
│  Conexão restaurada                                        │
│      │                                                      │
│      ▼                                                      │
│  Processar fila (FIFO)                                     │
│      │                                                      │
│      ├─── Sucesso? ──── Sim ────▶ Marcar como synced     │
│      │                                                      │
│      Não                                                    │
│      │                                                      │
│      ▼                                                      │
│  Incrementar tentativas                                   │
│      │                                                      │
│      ├─── Máximo de tentativas? ──── Sim ────▶ Marcar erro│
│      │                                                      │
│      Não                                                    │
│      │                                                      │
│      ▼                                                      │
│  Exponential backoff → Retry                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Upload Pendente

```typescript
// Service de sincronização
export const syncService = {
  // Processar fila
  async processQueue(): Promise<void> {
    const items = await SQLite.getPendingSyncItems();
    
    for (const item of items) {
      try {
        await SQLite.updateSyncStatus(item.id, 'syncing');
        
        switch (item.operation) {
          case 'create':
            await api.post(`/${item.entityType}`, item.payload);
            break;
          case 'update':
            await api.put(`/${item.entityType}/${item.entityId}`, item.payload);
            break;
          case 'delete':
            await api.delete(`/${item.entityType}/${item.entityId}`);
            break;
        }
        
        await SQLite.updateSyncStatus(item.id, 'synced');
      } catch (error) {
        await SQLite.updateSyncStatus(item.id, 'error', error.message);
      }
    }
  },

  // Observar conexão
  startNetworkListener(): void {
    Network.addNetworkStateListener((state) => {
      if (state.isConnected) {
        this.processQueue();
      }
    });
  },
};
```

### Indicador de Sincronização

```typescript
// Badge de sincronização
<SincronizacaoBadge
  pendentes={syncQueue.filter(i => i.status === 'pending').length}
  erros={syncQueue.filter(i => i.status === 'error').length}
/>
```

### Resolução de Conflitos

#### Estratégias

1. **Última atualização vence** — Mais simples, para dados não críticos
2. **Merge manual** — Para dados críticos (financeiro)
3. **Conflito explícito** — Notificar usuário para decidir

#### Implementação

```typescript
// Detectar conflito
const detectConflict = async (entityType: string, entityId: string, localData: Record<string, unknown>) => {
  const serverData = await api.get(`/${entityType}/${entityId}`);
  const serverTimestamp = new Date(serverData.updatedAt).getTime();
  const localTimestamp = localData.updatedAt;
  
  if (serverTimestamp > localTimestamp) {
    return {
      hasConflict: true,
      serverData,
      localData,
      serverTimestamp,
      localTimestamp,
    };
  }
  
  return { hasConflict: false };
};

// Resolver conflito
const resolveConflict = async (conflict, strategy: 'local' | 'server' | 'merge') => {
  switch (strategy) {
    case 'local':
      await api.put(`/${conflict.entityType}/${conflict.entityId}`, conflict.localData);
      break;
    case 'server':
      // Usar dados do servidor
      break;
    case 'merge':
      const merged = mergeData(conflict.localData, conflict.serverData);
      await api.put(`/${conflict.entityType}/${conflict.entityId}`, merged);
      break;
  }
};
```

### Idempotência

Todas as mutações devem ser idempotentes para evitar duplicidade:

```typescript
// Usar IDs client-generated ou request IDs
const createClient = async (data: CreateClientRequest) => {
  const requestId = uuid(); // ID único da requisição
  
  return api.post('/clients', {
    ...data,
    _requestId: requestId,  // Para idempotência
  });
};
```

---

## Princípios

### 1. Offline First

- O app deve funcionar sem conexão
- Dados devem ser preservados localmente
- Sincronização deve ser transparente

### 2. Resiliência

- Erros de rede não devem causar perda de dados
- Retry automático com backoff exponencial
- Filas de sincronização persistentes

### 3. Visibilidade

- Usuário deve saber o estado da sincronização
- Indicadores de progresso claros
- Notificações de conflitos

### 4. Segurança

- Operações financeiras não podem ser confirmadas antes da API
- Dados sensíveis não devem ficar no dispositivo sem criptografia
- Sincronização deve ser autenticada

### 5. Performance

- Sincronização em background
- Não bloquear UI durante upload
- Priorizar operações críticas

---

## Operações Financeiras

> ⚠️ **REGRAS CRÍTICAS**

1. **NUNCA** confirmar pagamento sem resposta da API
2. **NUNCA** mostrar saldo como confirmado offline
3. **SEMPRE** indicar "pendente de sincronização" para financeiro
4. **SEMPRE** exigir conexão para operações financeiras críticas

```typescript
// Exemplo: registrar pagamento
const registrarPagamento = async (data: PagamentoRequest) => {
  if (!isConnected) {
    throw new Error('Conexão necessária para registrar pagamento');
  }
  
  // Enviar direto para API
  return api.post('/payments', data);
};
```

---

## Próximos Passos

1. ✅ Fase 1 implementada (detecção, banner, retry)
2. 🔄 Implementar SQLite para rascunhos
3. 🔄 Criar fila de sincronização
4. 🔄 Implementar resolução de conflitos
5. 🔄 Adicionar indicadores de sincronização
6. 🔄 Testes de cenários offline
7. 🔄 Documentar limitações

---

**Documento:** OFFLINE.md  
**Última atualização:** Agosto 2026  
**Projeto:** SmartGesso Mobile