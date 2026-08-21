# SmartGesso Mobile — Fase 8: Offline e Publicação

## Status Atual

| Item | Status | Observação |
|------|--------|------------|
| Banner offline | ✅ | useNetworkStatus + OfflineBanner |
| Bloqueio ações financeiras | ✅ | Botões disabled offline |
| Fila de sincronização | ⏳ | Em implementação (subagent) |
| Indicador pendências | ⏳ | Em implementação (subagent) |
| Persistência drafts | ❌ | Não implementado |
| EAS Build | ✅ Config | eas.json + app.config.ts prontos |
| Credenciais Android | ❌ | Precisa keystore |
| Testes E2E | ❌ | Não configurados |
| Publicação Play Store | ❌ | Precisa credenciais |
| Piloto empresa | ❌ | Precisa app publicado |

## Próximos Passos

### 1. Fila de Sincronização (em andamento)
- Core: `src/services/offline/syncQueue.ts`
- Hook: `src/hooks/usePendingMutations.ts`
- Integração: pagamentos/novo, despesas/novo

### 2. Persistência de Drafts (futuro)
- Usar AsyncStorage para salvar rascunhos
- Sincronizar quando voltar online

### 3. EAS Build
```bash
# Login na conta Expo
eas login

# Build de preview (APK)
eas build --platform android --profile preview

# Build de produção
eas build --platform android --profile production
```

### 4. Testes E2E
- Configurar Detox ou Maestro
- Testar fluxo: login → criar orçamento → aprovar → serviço
- Testar offline: criar pagamento offline → voltar online → verificar sync

### 5. Publicação Play Store
- Gerar keystore (ou usar Android Studio)
- Configurar Google Play Console
- Upload APK/AAB
- Listing, screenshots, descrição

### 6. Piloto
- Empresa real testando
- Coleta de feedback
- Ajustes

## Credenciais Necessárias

1. **Conta Expo** (para EAS Build)
2. **Keystore Android** (para assinar APK)
3. **Google Play Console** (para publicar)
4. **Conta Google Play** (para devolder)

## Comandos Úteis

```bash
# Verificar config
eas diagnostics

# Build local (sem nuvem)
eas build --platform android --profile development --local

# Submit para Play Store
eas submit --platform android --profile production

# Verificar status do build
eas build:list
```
