import React, { useMemo } from 'react';
import { Link, Stack } from 'expo-router';
import { View, Text } from 'react-native';
import { createNotFoundStyles } from './styles';
import { useAppTheme } from '@/src/theme/ThemeProvider';

export default function NotFoundScreen() {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createNotFoundStyles(colors, isDark), [colors, isDark]);
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Página não encontrada</Text>
        <Link href="/" style={styles.link}>
          Voltar ao início
        </Link>
      </View>
    </>
  );
}
