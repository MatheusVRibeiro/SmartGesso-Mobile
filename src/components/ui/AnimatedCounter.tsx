import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, TextStyle } from 'react-native';

export interface AnimatedCounterProps {
  value: number;
  /** Prefixo (ex: 'R$ '). */
  prefix?: string;
  /** Duração em ms (default 800). */
  duration?: number;
  style?: StyleProp<TextStyle>;
  /** Formatação pt-BR (default true). */
  format?: boolean;
  /** Casas decimais (default 0). */
  decimals?: number;
}

/**
 * AnimatedCounter — contador que anima de 0 até o valor.
 *
 * Uso em KPIs (R$ 0 → R$ 12.450) do dashboard.
 * Usa Animated core com useNativeDriver (não anima texto — anima um
 * listener que atualiza o estado a cada frame via JS, ~60fps).
 */
export function AnimatedCounter({
  value,
  prefix = '',
  duration = 800,
  style,
  format = true,
  decimals = 0,
}: AnimatedCounterProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = React.useState(0);

  useEffect(() => {
    const listener = animatedValue.addListener(({ value: v }) => {
      setDisplay(v);
    });
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    const anim = Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false, // precisa do JS para atualizar texto
    });
    anim.start();
    return () => {
      anim.stop();
      animatedValue.removeListener(listener);
    };
  }, [animatedValue, value, duration]);

  const formatted = format
    ? display.toLocaleString('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : String(Math.round(display));

  return (
    <Animated.Text style={style}>
      {prefix}
      {formatted}
    </Animated.Text>
  );
}

export default AnimatedCounter;
