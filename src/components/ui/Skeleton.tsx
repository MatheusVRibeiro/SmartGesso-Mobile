import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius } from '../../theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: ViewStyle | ViewStyle[];
}

/**
 * Skeleton loading — placeholder animado enquanto dados carregam.
 * Substitui spinners em telas de lista (Fase 4 — skill impeccable).
 */
export function Skeleton({
  width = '100%',
  height = 16,
  radius: radiusProp = radius.sm,
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
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
  }, [opacity]);

  return (
    <Animated.View
      testID="skeleton"
      style={[
        styles.base,
        { width, height, borderRadius: radiusProp, opacity },
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

export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <View style={listStyles.list}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={listStyles.row}>
          <Skeleton width={40} height={40} radius={radius.full} />
          <View style={listStyles.rowContent}>
            <Skeleton width="70%" height={16} />
            <Skeleton width="40%" height={12} />
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