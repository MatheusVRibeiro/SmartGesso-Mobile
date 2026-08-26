import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius } from '../../theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: ViewStyle | ViewStyle[];
  /**
   * Efeito shimmer (Etapa 2): pulso de opacidade 0.4 → 1 → 0.4 em loop
   * (gradiente simulado via Animated core, useNativeDriver).
   * Default: true.
   */
  shimmer?: boolean;
  /** Cor base do placeholder (default colors.divider). */
  highlightColor?: string;
}

/**
 * Skeleton loading — placeholder animado enquanto dados carregam.
 * Substitui spinners em telas de lista (Fase 4 — skill impeccable).
 * Etapa 2: prop shimmer (pulso de opacidade) + highlightColor.
 */
export function Skeleton({
  width = '100%',
  height = 16,
  radius: radiusProp = radius.sm,
  style,
  shimmer = true,
  highlightColor = colors.divider,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(shimmer ? 0.4 : 1)).current;

  useEffect(() => {
    if (!shimmer) {
      opacity.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, shimmer]);

  return (
    <Animated.View
      testID="skeleton"
      style={[
        styles.base,
        {
          width,
          height,
          borderRadius: radiusProp,
          backgroundColor: highlightColor,
          opacity,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.divider,
  },
});

export function SkeletonList({
  rows = 5,
  shimmer = true,
  highlightColor,
}: {
  rows?: number;
  shimmer?: boolean;
  highlightColor?: string;
}) {
  return (
    <View style={listStyles.list}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={listStyles.row}>
          <Skeleton
            width={40}
            height={40}
            radius={radius.full}
            shimmer={shimmer}
            highlightColor={highlightColor}
          />
          <View style={listStyles.rowContent}>
            <Skeleton
              width="70%"
              height={16}
              shimmer={shimmer}
              highlightColor={highlightColor}
            />
            <Skeleton
              width="40%"
              height={12}
              shimmer={shimmer}
              highlightColor={highlightColor}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const listStyles = StyleSheet.create({
  list: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowContent: { flex: 1, gap: 6 },
});
