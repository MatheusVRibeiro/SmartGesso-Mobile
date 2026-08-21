# Sistema de Fila de Sincronização Offline

## Visão Geral

Sistema para persistir mutações offline e sincronizá-las automaticamente quando o dispositivo voltar a ficar online. Suporta retry com backoff exponencial e monitoramento de pendências.

## Arquivos

- `src/services/offline/syncQueue.ts` - Core da fila de mutações
- `src/services/offline/processor.ts` - Processador da fila
- `src/hooks/usePendingMutations.ts` - Hook para UI

## Uso

### Adicionar Mutação

```typescript
import { addMutation } from './services/offline/syncQueue';

await addMutation({
  type: 'payment',
  endpoint: 'https://api.example.com/payments',
  method: 'POST',
  body: { amount: 100, description: 'Pagamento offline' },
});
```

### Usar Hook na UI

```typescript
import { usePendingMutations } from './hooks/usePendingMutations';

function MyComponent() {
  const { count, mutations, isLoading, refresh } = usePendingMutations();
  
  return (
    <View>
      {count > 0 && (
        <Badge>{count} pendências</Badge>
      )}
      <Button title="Sincronizar" onPress={refresh} />
    </View>
  );
}
```

### Processar Fila

O processador automaticamente:
1. Monitora mudanças na conectividade
2. Processa mutações pendentes quando volta online
3. Aplica retry com backoff exponencial (max 3 tentativas)
4. Remove mutações processadas com sucesso

## Funcionalidades

1. **Persistência**: Mutações são salvas em AsyncStorage
2. **FIFO**: Processa na ordem que foram adicionadas
3. **Retry**: Backoff exponencial (1s, 2s, 4s, max 30s)
4. **Monitoramento**: Hook retorna contagem e lista de pendências
5. **Limpeza**: Mutações bem-sucedidas são removidas automaticamente
