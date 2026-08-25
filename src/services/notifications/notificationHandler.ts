/**
 * SmartGesso Mobile — Handler de notificações push (V3 §79, Mobile Fase 1).
 *
 * Registra os listeners globais do expo-notifications:
 * - `addNotificationResponseReceivedListener`: o usuário TOCOU na notificação
 *   (foreground, background ou cold start). Se o payload carregar `data.route`,
 *   navega para essa rota via expo-router.
 * - `addNotificationReceivedListener`: notificação chegou com o app em
 *   foreground — invalida as queries de notificações para atualizar a UI.
 *
 * `setupNotificationHandler()` deve ser chamado uma única vez no layout raiz
 * (app/_layout.tsx). Retorna uma função de cleanup que remove os listeners.
 */
import { router, type Href } from 'expo-router';
import * as Notifications from 'expo-notifications';
import type { EventSubscription } from 'expo-modules-core';
import { queryClient } from '../../lib/queryClient';
import { useSessionStore } from '../../store/useSessionStore';

/**
 * Extrai a rota de destino do payload da notificação.
 * Aceita `data.route` como string (ex.: "/(app)/orcamentos") e a devolve
 * como `Href` para o expo-router. Retorna `null` quando não há rota.
 */
function extractRoute(response: Notifications.NotificationResponse): Href | null {
  const data = response?.notification?.data;
  if (!data) return null;
  const route = data.route;
  if (typeof route === 'string' && route.length > 0) {
    return route as Href;
  }
  return null;
}

/**
 * Registra os listeners de notificação push.
 *
 * @returns Função de cleanup que remove os listeners (para testes/unmount).
 */
export function setupNotificationHandler(): () => void {
  // Toque na notificação → navega para a rota indicada em data.route.
  const responseSubscription: EventSubscription =
    Notifications.addNotificationResponseReceivedListener((response) => {
      const route = extractRoute(response);
      if (route) {
        router.push(route);
      }
    });

  // Notificação em foreground → atualiza a lista de notificações.
  const receivedSubscription: EventSubscription =
    Notifications.addNotificationReceivedListener(() => {
      const companyId = useSessionStore.getState().activeCompany?.company?.id;
      if (companyId) {
        queryClient.invalidateQueries({
          queryKey: ['company', companyId, 'notificacoes'],
        });
      }
    });

  return () => {
    responseSubscription.remove();
    receivedSubscription.remove();
  };
}
