import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSessionStore } from '@/src/store/useSessionStore';
import { colors } from '@/src/theme';
import { createSplashStyles } from './styles';
import { useAppTheme } from '@/src/theme/ThemeProvider';

export default function SplashScreen() {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createSplashStyles(colors, isDark), [colors, isDark]);
  const sessionStatus = useSessionStore((s) => s.sessionStatus);
  const router = useRouter();

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      router.replace('/(app)/(tabs)');
    } else if (sessionStatus === 'unauthenticated') {
      router.replace('/(auth)/login');
    }
  }, [sessionStatus, router]);

  if (sessionStatus === 'initializing') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.text}>Carregando...</Text>
      </View>
    );
  }

  return null;
}
