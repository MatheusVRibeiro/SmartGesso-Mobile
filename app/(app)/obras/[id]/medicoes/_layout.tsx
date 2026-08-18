import { Stack } from 'expo-router';
import { BackButton } from '../../../../../src/components/navigation/BackButton';
import { colors, typography } from '../../../../../src/theme';

export default function MedicoesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLeft: () => <BackButton />,
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text, fontFamily: typography.weights.bold },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Medições' }} />
      <Stack.Screen name="novo" options={{ title: 'Nova Medição' }} />
      <Stack.Screen name="[medicaoId]" options={{ title: 'Detalhes da Medição' }} />
    </Stack>
  );
}