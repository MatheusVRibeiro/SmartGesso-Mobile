import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { queryClient } from '../src/lib/queryClient';
import { setUnauthorizedHandler } from '../src/services/api/client';
import { useSessionStore } from '../src/store/useSessionStore';
import { OfflineBanner } from '../src/components/ui/OfflineBanner';
import { useNetworkStatus } from '../src/hooks/useNetworkStatus';
import { colors } from '../src/theme';

export default function RootLayout() {
  const router = useRouter();
  const sessionStatus = useSessionStore((s) => s.sessionStatus);
  const clearSession = useSessionStore((s) => s.clearSession);
  const { isOffline } = useNetworkStatus();

  // Quando o refresh token falha (401), limpa a sessão e o cache.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      queryClient.clear();
      clearSession();
    });
  }, [clearSession]);

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