import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TouchableOpacity, ViewStyle } from 'react-native';
import { sizes } from '../../theme';
import { useAppTheme } from '../../theme/ThemeProvider';

export interface BackButtonProps {
  onPress?: () => void;
  fallback?: string;
  style?: ViewStyle;
}

export function BackButton({
  onPress,
  fallback = '/(app)/(tabs)/mais',
  style,
}: BackButtonProps = {}) {
  const router = useRouter();
  const { colors } = useAppTheme();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallback as any);
    }
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Voltar"
      onPress={handlePress}
      hitSlop={8}
      style={[
        {
          minWidth: sizes.touchTarget,
          minHeight: sizes.touchTarget,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
    >
      <Ionicons name="arrow-back" size={sizes.icon.lg} color={colors.text} />
    </TouchableOpacity>
  );
}

export default BackButton;
