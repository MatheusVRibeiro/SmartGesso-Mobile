import { Stack } from 'expo-router';
import { BackButton } from '../../../src/components/navigation/BackButton';
import { colors, typography } from '../../../src/theme';

export default function CatalogoLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLeft: () => <BackButton />,
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text, fontFamily: typography.weights.bold },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Catálogo' }} />
      <Stack.Screen name="materiais" options={{ title: 'Materiais' }} />
      <Stack.Screen name="movimento" options={{ title: 'Novo movimento' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detalhe do material' }} />
      <Stack.Screen name="servicos" options={{ title: 'Serviços' }} />
      <Stack.Screen name="produtos" options={{ title: 'Produtos' }} />
    </Stack>
  );
}
