import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export interface NetworkStatus {
  isOnline: boolean;
  isOffline: boolean;
}

/**
 * Hook de status de rede (V3 — seção 66: suporte offline).
 *
 * Usa @react-native-community/netinfo e expõe `isOnline`/`isOffline`
 * para a UI (banner offline, bloqueio de ações financeiras, etc.).
 *
 * Heurística: considera offline apenas quando a conectividade é
 * explicitamente negada (`isConnected === false` ou
 * `isInternetReachable === false`). Valores nulos/indefinidos
 * (primeira leitura, plataformas sem suporte) são tratados como online
 * para não bloquear a interface por engano.
 */
export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Web: NetInfo não propaga eventos de forma confiável — usa navigator.onLine.
    if (Platform.OS === 'web') {
      const update = () => setIsOnline(navigator.onLine);
      update();
      window.addEventListener('online', update);
      window.addEventListener('offline', update);
      return () => {
        window.removeEventListener('online', update);
        window.removeEventListener('offline', update);
      };
    }

    const unsubscribe = NetInfo.addEventListener((state) => {
      const online =
        state.isConnected !== false && state.isInternetReachable !== false;
      setIsOnline(online);
    });

    return unsubscribe;
  }, []);

  return { isOnline, isOffline: !isOnline };
}