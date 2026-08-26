import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';

interface FadeInViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Duração em ms (default 300 — design system ui-ux-pro-max). */
  duration?: number;
  /** Atraso em ms (para stagger em listas). */
  delay?: number;
  /** Deslocamento vertical inicial em px (default 8). */
  translateY?: number;
}

/**
 * FadeInView — fade + slide-up ao montar.
 *
 * Design system ui-ux-pro-max: fade 300ms, entrada suave.
 * Usa Animated core com useNativeDriver.
 */
export function FadeInView({
  children,
  style,
  duration = 300,
  delay = 0,
  translateY = 8,
}: FadeInViewProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(translateY)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [opacity, translate, duration, delay]);

  return (
    <Animated.View
      style={[style, { opacity, transform: [{ translateY: translate }] }]}
    >
      {children}
    </Animated.View>
  );
}

export default FadeInView;
