# SmartGesso Mobile — Setup de Push Notifications + EAS Build

Guia de configuração e teste de push notifications (Expo Push Service) e builds
EAS. Mantido em conjunto com a implementação de push (V3 §79, Mobile Fase 1).

> **Status da verificação (2026-08-25):** push registration + handler já
> implementados e integrados no `app/_layout.tsx`. Este documento documenta o
> estado da configuração e os passos para testar em device físico.

---

## 1. Estado da configuração (verificado)

| Item | Arquivo | Status | Detalhe |
| --- | --- | --- | --- |
| `scheme` | `app.config.ts` | ✅ presente | `scheme: 'smartgesso'` (necessário para deep-link / push) |
| `extra.eas.projectId` | `app.config.ts` | ✅ presente | `extra.eas.projectId: 'smartgesso'` |
| `expo-notifications` no `plugins[]` | `app.config.ts` | ⚠️ ausente | Não está no array de plugins (ver §4) |
| `eas.json` | `eas.json` | ✅ existe | Perfis `development`, `preview`, `production` (todos `apk`) |
| `expo-device` | `package.json` | ✅ presente | `~57.0.1` — dependência de `pushRegistration.ts` (`Device.isDevice`) |
| `@react-native-async-storage/async-storage` | `package.json` | ✅ presente | `2.2.0` — usado pelo modo offline |
| `expo-notifications` | `package.json` | ✅ presente | `~57.0.12` |

### Arquivos de push (já implementados)

- `src/services/notifications/pushRegistration.ts` —
  `registerForPushNotificationsAsync()`: pede permissão, lê
  `Constants.expoConfig?.extra?.eas?.projectId` e obtém o token Expo
  (`getExpoPushTokenAsync({ projectId })`). Retorna `null` em simulador
  (`!Device.isDevice`), permissão negada ou qualquer erro.
- `src/services/notifications/notificationHandler.ts` —
  `setupNotificationHandler()`: listeners globais (toque → navega via
  `data.route`; foreground → invalida queries de notificação).
- `src/hooks/usePushRegistration.ts` — `usePushRegistration()`: no mount, se
  houver sessão autenticada + empresa ativa, obtém o token e chama
  `notificationsApi.registerPushToken(token)` (`POST /notifications/tokens`).
- `app/_layout.tsx` — chama `usePushRegistration()` e
  `setupNotificationHandler()` no layout raiz.

---

## 2. Como testar push (device físico)

> **Push NÃO funciona em web nem em simulador/emulador.**
> `registerForPushNotificationsAsync()` retorna `null` quando
> `Device.isDevice` é `false` (simulador/emulador/web). Para testar de verdade,
> use um **device físico Android** com o app instalado.

### Passos

1. **Pré-requisitos**
   - Conta Expo/EAS logada: `eas login`
   - Device físico Android conectado (USB debugging habilitado) ou acesso à
     build via QR code.
   - Backend no ar com o endpoint `POST /notifications/tokens` e a variável
     `EXPO_ACCESS_TOKEN` no `.env` do backend (ver §3).

2. **Gerar a build de desenvolvimento (APK)**
   ```bash
   eas build --profile development --platform android
   ```
   - O perfil `development` usa `developmentClient: true` +
     `distribution: "internal"` + `android.buildType: "apk"` (ver `eas.json`).
   - Ao final, o EAS mostra um QR code / URL para instalar o APK no device.

3. **Instalar no device físico**
   - Escaneie o QR code com a app **Expo Go** (development client) ou instale o
     APK diretamente.
   - Para o perfil `development` (development client), use a app Expo Go
     correspondente à versão do SDK, ou baixe o APK e instale.

4. **Abrir o app e logar**
   - Faça login com uma conta que tenha empresa ativa.
   - O `usePushRegistration()` roda no mount do layout raiz: pede permissão de
     notificação, obtém o token Expo e envia para o backend.
   - **Aceite a permissão** quando o Android pedir ("SmartGesso quer enviar
     notificações").

5. **Confirmar o registro do token**
   - No backend, verifique se o token foi persistido
     (`POST /notifications/tokens` → tabela de tokens de push).
   - O token tem o prefixo `Expo/` (Expo Push Service).

6. **Disparar um push de teste (via backend)**
   - O backend envia o push usando o **Expo Push Service**
     (`https://api.expo.dev/v2/push`) com o `EXPO_ACCESS_TOKEN` (ver §3).
   - Payload mínimo:
     ```json
     {
       "to": "<ExpoPushToken>",
       "sound": "default",
       "data": { "route": "/(app)/orcamentos" }
     }
     ```
   - Ao tocar na notificação, o app navega para `data.route`
     (`notificationHandler.ts`).

### Checklist rápido de teste

- [ ] Build `development` gerada com sucesso (`eas build`)
- [ ] APK instalado em device físico
- [ ] Permissão de notificação concedida
- [ ] Token registrado no backend (visível na tabela de tokens)
- [ ] Push recebido no device (foreground e background)
- [ ] Toque na notificação navega para a rota correta

---

## 3. `EXPO_ACCESS_TOKEN` no backend

O **backend** (não o app mobile) precisa de `EXPO_ACCESS_TOKEN` para enviar
pushes pelo Expo Push Service.

- Gere o token no painel: **Expo → Project → Push Notifications → Access
  Tokens** (ou `eas` / API keys).
- Adicione ao `.env` do backend:
  ```env
  EXPO_ACCESS_TOKEN=seu_token_aqui
  ```
- O backend usa esse token no header `Authorization: Bearer <EXPO_ACCESS_TOKEN>`
  ao chamar `https://api.expo.dev/v2/push`.
- **Nunca** coloque `EXPO_ACCESS_TOKEN` no app mobile (é um segredo de servidor).
  O `.env.example` do mobile só tem variáveis `EXPO_PUBLIC_*` (públicas).

> O `extra.eas.projectId` no `app.config.ts` é o que vincula o app ao projeto
> EAS e é usado pelo `getExpoPushTokenAsync({ projectId })`. Para o Expo Push
> Service, o `projectId` real (UUID) é o ideal — ver §4.

---

## 4. Recomendações / pendências

### 4.1 `expo-notifications` no array de plugins (recomendado)

O plugin `expo-notifications` **não está** no `plugins[]` do `app.config.ts`.
Para push básico via Expo Push Service ele é **opcional** (o app já registra e
recebe tokens sem ele), mas é **recomendado** para:

- Configurar ícone/cor de notificação (Android) e categorias (iOS).
- Garantir o setup nativo correto em builds EAS (evita surpresas de permissão).

Para adicionar (quando quiser, sem quebrar o que já funciona):
```ts
// app.config.ts → plugins
plugins: [
  'expo-router',
  'expo-image',
  'expo-sharing',
  'expo-notifications', // ← adicionar
  [
    'expo-image-picker',
    {
      photosPermission: '...',
      cameraPermission: '...',
    },
  ],
],
```
> Não foi adicionado nesta verificação para **não alterar a configuração nativa
> sem necessidade** (instrução: "NÃO quebrar nada"). Adicione e rode
> `eas build` novamente para aplicar.

### 4.2 `extra.eas.projectId`

O valor atual é `'smartgesso'` (slug), não o **UUID** do projeto EAS. Para o
Expo Push Service, o `projectId` ideal é o UUID retornado pelo EAS
(disponível em `eas whoami` / painel do projeto / `app.json` após
`eas init`). Se o push não resolver o projeto, troque para o UUID real:
```ts
extra: {
  eas: {
    projectId: '<UUID-DO-PROJETO-EAS>',
  },
},
```

### 4.3 `eas.json` — buildType

O `eas.json` atual usa `buildType: "apk"` em todos os perfis. Para publicar na
Play Store, o perfil `production` deve usar `buildType: "app-bundle"` (AAB).
Para testes internos (development/preview), `apk` está correto.

---

## 5. Referências

- Expo Push Service: https://docs.expo.dev/guides/push-notifications/
- EAS Build: https://docs.expo.dev/eas/build/
- `expo-notifications` (config plugin): https://docs.expo.dev/versions/latest/sdk/notifications/
- Implementação local:
  - `src/services/notifications/pushRegistration.ts`
  - `src/services/notifications/notificationHandler.ts`
  - `src/hooks/usePushRegistration.ts`
  - `app/_layout.tsx`
