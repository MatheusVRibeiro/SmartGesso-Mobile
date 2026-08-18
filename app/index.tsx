import { useEffect } from 'react';
import { ActivityIndicator, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSessionStore } from '../src/store/useSessionStore';
import { useSessionBootstrap } from '../src/hooks/useSessionBootstrap';
import { colors } from '../src/theme/colors';

export default function Index() {
  const sessionStatus = useSessionStore((s) => s.sessionStatus);
  const router = useRouter();

  // Restaura a sessão no primeiro render (token → /auth/me → store)
  useSessionBootstrap();

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
});