import { Stack } from 'expo-router';
import { BackButton } from '../../../src/components/navigation/BackButton';
import { colors, typography } from '../../../src/theme';

export default function OrcamentosLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLeft: () => <BackButton />,
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text, fontFamily: typography.weights.bold },
      }}
    >
      <Stack.Screen name="novo" options={{ title: 'Novo Orçamento' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detalhes do Orçamento' }} />
    </Stack>
  );
}
