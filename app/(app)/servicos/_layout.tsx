import { Stack } from 'expo-router';
import { BackButton } from '../../../src/components/navigation/BackButton';
import { colors, typography } from '../../../src/theme';

export default function ServicosLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLeft: () => <BackButton />,
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text, fontFamily: typography.weights.bold },
      }}
    >
      <Stack.Screen name="novo" options={{ title: 'Nova Ordem de Serviço' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detalhes do Serviço' }} />
      <Stack.Screen name="[id]/garantia" options={{ title: 'Garantia e Retorno' }} />
    </Stack>
  );
}
