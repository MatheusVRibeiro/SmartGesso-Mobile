import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native';

export interface PressableScaleProps {
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
  accessibilityRole,
  scaleTo = 0.97,
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    try {
      Promise.resolve(AccessibilityInfo.isReduceMotionEnabled())
        .then((value) => {
          if (typeof value === 'boolean') setReduceMotion(value);
        })
        .catch(() => {});
      const subscription = AccessibilityInfo.addEventListener?.(
        'reduceMotionChanged',
        setReduceMotion,
      );
      return () => subscription?.remove?.();
    } catch {
      return undefined;
    }
  }, []);

  const animateTo = (value: number) => {
    if (reduceMotion) {
      // Reduce Motion ativo: sem animação de scale, toque funciona normal.
      scale.setValue(1);
      return;
    }
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
