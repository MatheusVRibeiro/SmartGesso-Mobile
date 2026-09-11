import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { queryClient } from '../src/lib/queryClient';
import { setUnauthorizedHandler, setAccessDeniedHandler } from '../src/services/api/client';
import { useSessionStore } from '../src/store/useSessionStore';
import { useSessionBootstrap } from '../src/hooks/useSessionBootstrap';
import { ThemeProvider, useAppTheme } from '../src/theme/ThemeProvider';
import { OfflineBanner } from '../src/components/ui/OfflineBanner';
import { useNetworkStatus } from '../src/hooks/useNetworkStatus';
import { usePendingMutationsCount } from '../src/hooks/usePendingMutationsCount';
import { usePushRegistration } from '../src/hooks/usePushRegistration';
import { setupNotificationHandler } from '../src/services/notifications/notificationHandler';

function ThemedRootApp() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const sessionStatus = useSessionStore((s) => s.sessionStatus);
  const clearSession = useSessionStore((s) => s.clearSession);
  const { isOffline } = useNetworkStatus();
  const pendingCount = usePendingMutationsCount();
  const setAccessStatus = useSessionStore((s) => s.setAccessStatus);

  useSessionBootstrap();
  usePushRegistration();

  useEffect(() => {
    return setupNotificationHandler();
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      queryClient.clear();
      clearSession();
    });
  }, [clearSession]);

  useEffect(() => {
    setAccessDeniedHandler(() => {
      setAccessStatus('COMPANY_ACCESS_SUSPENDED');
      router.replace('/(company)/access-suspended');
    });
  }, [router, setAccessStatus]);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.replace('/(auth)/login');
    }
  }, [sessionStatus, router]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {isOffline ? (
        <SafeAreaView edges={['top']} style={{ backgroundColor: colors.warning }}>
          <OfflineBanner visible pendingCount={pendingCount} />
        </SafeAreaView>
      ) : null}
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ThemedRootApp />
        </SafeAreaProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
