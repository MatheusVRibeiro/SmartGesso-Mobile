/**
 * SmartGesso Mobile — Hook de registro de token push (V3 §79, Mobile Fase 1).
 *
 * No mount, se houver sessão autenticada com empresa ativa, obtém o token
 * push do dispositivo e o registra no backend (POST /notifications/tokens).
 *
 * - Não bloqueia a UI: roda em background, erros são silenciosos.
 * - Guard (useRef) evita re-registrar múltiplas vezes no mesmo ciclo de vida.
 *
 * Uso: chamar `usePushRegistration()` no layout raiz (app/_layout.tsx).
 */
import { useEffect, useRef } from 'react';
import { notificationsApi } from '../services/api/notifications';
import { registerForPushNotificationsAsync } from '../services/notifications/pushRegistration';
import { useSessionStore } from '../store/useSessionStore';

/**
 * Registra o token push do dispositivo no backend quando há sessão logada
 * com empresa ativa. Seguro para chamar em qualquer componente montado no
 * layout raiz — não faz nada se a sessão ainda não está pronta.
 */
export function usePushRegistration(): void {
  const registeredRef = useRef(false);

  useEffect(() => {
    // Guard: registra apenas uma vez por ciclo de vida.
    if (registeredRef.current) {
      return;
    }

    const sessionStatus = useSessionStore.getState().sessionStatus;
    const activeCompany = useSessionStore.getState().activeCompany;

    // Só registra com sessão autenticada e empresa ativa.
    if (sessionStatus !== 'authenticated' || !activeCompany) {
      return;
    }

    registeredRef.current = true;

    // Não bloqueia a UI: fire-and-forget com catch silencioso.
    (async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          await notificationsApi.registerPushToken(token);
        }
      } catch {
        // Erro de registro não deve afetar a experiência do usuário.
      }
    })();
  }, []);
}
