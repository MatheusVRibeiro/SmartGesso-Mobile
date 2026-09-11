/**
 * SmartGesso Mobile — Registro de token push (V3 §79, Mobile Fase 1).
 *
 * Solicita permissão de notificação, obtém o token Expo push e o devolve
 * para o caller registrar no backend (POST /notifications/tokens).
 *
 * Regras:
 * - Push não funciona em simulador/emulador — `Device.isDevice` false ⇒ null.
 * - Erros (permissão negada, sem suporte, falha de rede) ⇒ null (nunca crash).
 * - Expo Go Android (SDK 53+): push foi removido do Expo Go client e lança erro fatal;
 *   deve retornar null silenciosamente.
 */
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

const isExpoGoAndroid =
  Platform.OS === 'android' &&
  (Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
    Constants.appOwnership === 'expo');

/**
 * Solicita permissão de notificação e obtém o token Expo push do dispositivo.
 *
 * @returns O token Expo push (`ExpoPushToken.data`) ou `null` quando:
 *   - o app roda em Expo Go no Android (remoto removido no SDK 53+);
 *   - o app roda em simulador/emulador (push indisponível);
 *   - a permissão de notificação é negada;
 *   - qualquer erro ocorre (ambiente sem suporte, falha de rede, etc.).
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Expo Go no Android SDK 53+ lança erro fatal se expo-notifications for usado para push remoto
  if (isExpoGoAndroid) {
    return null;
  }

  try {
    // Push não funciona em simulador/emulador — evita erro de token.
    if (!Device.isDevice) {
      return null;
    }

    // Carregamento dinâmico seguro para evitar side-effects durante bundle
    const Notifications = require('expo-notifications');

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? undefined;
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data;
  } catch {
    // Sem suporte a push no ambiente (ex.: web) ou erro de permissão/rede.
    return null;
  }
}
