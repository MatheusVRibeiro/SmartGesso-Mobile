import { Stack } from 'expo-router';
import { BackButton } from '../../../src/components/navigation/BackButton';
import { colors, typography } from '../../../src/theme';

export default function PagamentosLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLeft: () => <BackButton />,
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text, fontFamily: typography.weights.bold },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Pagamentos' }} />
      <Stack.Screen name="novo" options={{ title: 'Novo Pagamento' }} />
      <Stack.Screen name="[id]" options={{ title: 'Editar Pagamento' }} />
    </Stack>
  );
}
