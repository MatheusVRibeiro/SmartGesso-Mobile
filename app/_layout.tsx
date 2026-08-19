import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { queryClient } from '../src/lib/queryClient';
import { setUnauthorizedHandler, setAccessDeniedHandler } from '../src/services/api/client';
import { useSessionStore } from '../src/store/useSessionStore';
import { useSessionBootstrap } from '../src/hooks/useSessionBootstrap';
import { OfflineBanner } from '../src/components/ui/OfflineBanner';
import { useNetworkStatus } from '../src/hooks/useNetworkStatus';
import { colors } from '../src/theme';

export default function RootLayout() {
  const router = useRouter();
  const sessionStatus = useSessionStore((s) => s.sessionStatus);
  const clearSession = useSessionStore((s) => s.clearSession);
  const { isOffline } = useNetworkStatus();

  const setAccessStatus = useSessionStore((s) => s.setAccessStatus);

  // V3: restaura a sessão em QUALQUER rota (inclusive deep-link/reload no web).
  // Antes rodava só em app/index.tsx — navegação direta deixava activeCompany null
  // e as queries escopadas por empresa desabilitadas (telas vazias).
  useSessionBootstrap();

  // Quando o refresh token falha (401), limpa a sessão e o cache.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      queryClient.clear();
      clearSession();
    });
  }, [clearSession]);

  // V3 §61: quando a API retorna 403 (acesso suspenso/negado), redireciona.
  useEffect(() => {
    setAccessDeniedHandler(() => {
      setAccessStatus('COMPANY_ACCESS_SUSPENDED');
      router.replace('/(company)/access-suspended');
    });
  }, [router, setAccessStatus]);

  // Redireciona para login quando a sessão é limpa (token expirado/inválido).
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.replace('/(auth)/login');
    }
  }, [sessionStatus, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <View style={{ flex: 1 }}>
          {/* V3 — seção 66: banner offline global (não bloqueia navegação). */}
          {isOffline ? (
            <SafeAreaView edges={['top']} style={{ backgroundColor: colors.warning }}>
              <OfflineBanner visible />
            </SafeAreaView>
          ) : null}
          <Stack screenOptions={{ headerShown: false }} />
        </View>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}