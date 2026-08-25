/**
 * SmartGesso Mobile — Registro de token push (V3 §79, Mobile Fase 1).
 *
 * Solicita permissão de notificação, obtém o token Expo push e o devolve
 * para o caller registrar no backend (POST /notifications/tokens).
 *
 * Regras:
 * - Push não funciona em simulador/emulador — `Device.isDevice` false ⇒ null.
 * - Erros (permissão negada, sem suporte, falha de rede) ⇒ null (nunca crash).
 */
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

/**
 * Solicita permissão de notificação e obtém o token Expo push do dispositivo.
 *
 * @returns O token Expo push (`ExpoPushToken.data`) ou `null` quando:
 *   - o app roda em simulador/emulador (push indisponível);
 *   - a permissão de notificação é negada;
 *   - qualquer erro ocorre (ambiente sem suporte, falha de rede, etc.).
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    // Push não funciona em simulador/emulador — evita erro de token.
    if (!Device.isDevice) {
      return null;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? undefined;
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data;
  } catch {
    // Sem suporte a push no ambiente (ex.: web) ou erro de permissão/rede.
    return null;
  }
}
