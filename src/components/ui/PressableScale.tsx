import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native';

interface PressableScaleProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'tab' | 'link';
  /** Escala ao pressionar (default 0.97 — spring do design system). */
  scaleTo?: number;
}

/**
 * PressableScale — botão com feedback de press (spring scale).
 *
 * Design system ui-ux-pro-max: spring press scale 0.97, 150ms.
 * Usa Animated core com useNativeDriver (zero lib extra).
 */
export function PressableScale({
  children,
  onPress,
  style,
  disabled,
  accessibilityLabel,
  accessibilityRole = 'button',
  scaleTo = 0.97,
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        onPressIn={() => animateTo(scaleTo)}
        onPressOut={() => animateTo(1)}
        style={{ opacity: disabled ? 0.6 : 1 }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export default PressableScale;
