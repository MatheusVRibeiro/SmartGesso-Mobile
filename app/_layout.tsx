import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from '../src/lib/queryClient';
import { setUnauthorizedHandler } from '../src/services/api/client';
import { useSessionStore } from '../src/store/useSessionStore';

export default function RootLayout() {
  const router = useRouter();
  const sessionStatus = useSessionStore((s) => s.sessionStatus);
  const clearSession = useSessionStore((s) => s.clearSession);

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
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}