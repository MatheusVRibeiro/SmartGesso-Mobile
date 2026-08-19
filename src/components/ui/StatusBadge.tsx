import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

export type StatusBadgeVariant =
  | 'active'
  | 'warning'
  | 'suspended'
  | 'cancelled'
  | 'expired'
  | 'info';

export type StatusBadgeSize = 'sm' | 'md';

const STATUS_CONFIG: Record<
  StatusBadgeVariant,
  { label: string; backgroundColor: string; color: string }
> = {
  active: { label: 'Ativo', backgroundColor: colors.successSoft, color: colors.success },
  warning: { label: 'Atenção', backgroundColor: colors.warningSoft, color: colors.warning },
  suspended: { label: 'Suspenso', backgroundColor: colors.dangerSoft, color: colors.danger },
  cancelled: { label: 'Cancelado', backgroundColor: colors.dangerSoft, color: colors.danger },
  expired: { label: 'Expirado', backgroundColor: colors.dangerSoft, color: colors.danger },
  info: { label: 'Informação', backgroundColor: colors.infoSoft, color: colors.info },
};

export interface StatusBadgeProps {
  status: StatusBadgeVariant;
  /** Texto customizado (default: rótulo padrão do status). */
  label?: string;
  size?: StatusBadgeSize;
  style?: ViewStyle;
  testID?: string;
}

function StatusBadge({
  status,
  label,
  size = 'md',
  style,
  testID,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <View
      testID={testID}
      style={[
        styles.badge,
        size === 'sm' ? styles.badgeSm : styles.badgeMd,
        { backgroundColor: config.backgroundColor },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          size === 'sm' ? styles.textSm : styles.textMd,
          { color: config.color },
        ]}
      >
        {label ?? config.label}
      </Text>
    </View>
  );
}

export default StatusBadge;
export { StatusBadge };

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeMd: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  text: {
    fontWeight: typography.weights.semibold,
  },
  textSm: {
    fontSize: typography.sizes.xs,
  },
  textMd: {
    fontSize: typography.sizes.sm,
  },
});
