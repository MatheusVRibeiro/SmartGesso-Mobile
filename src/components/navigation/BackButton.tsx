import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { colors, sizes } from '../../theme';

export function BackButton() {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
      <Ionicons name="arrow-back" size={sizes.icon.lg} color={colors.text} />
    </TouchableOpacity>
  );
}
