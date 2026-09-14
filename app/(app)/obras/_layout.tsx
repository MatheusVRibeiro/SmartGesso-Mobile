import { useAppTheme } from '../../../src/theme/ThemeProvider';
import { Stack } from 'expo-router';
import { BackButton } from '../../../src/components/navigation/BackButton';
import { colors, typography } from '../../../src/theme';

export default function ObrasLayout() {
  const { colors } = useAppTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLeft: () => <BackButton />,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text, fontFamily: typography.weights.bold },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Obras' }} />
      <Stack.Screen name="novo" options={{ title: 'Nova Obra' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detalhes da Obra' }} />
    </Stack>
  );
}
