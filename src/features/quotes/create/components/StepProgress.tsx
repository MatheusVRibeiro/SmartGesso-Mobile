/**
 * SmartGesso Mobile — V5 ETAPA 9: indicador de progresso das etapas do
 * wizard de orçamento. Extraído verbatim do monólito
 * src/screens/Orcamentos/NovoOrcamento/index.tsx — zero mudança de comportamento.
 */
import React, { useMemo } from 'react';
import type { ComponentProps } from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { sizes } from '@/src/theme';
import { createWizardStyles } from '../wizardStyles';
import { STEP_META } from '../types';

export function StepProgress({ current }: { current: number }) {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createWizardStyles(colors, isDark), [colors, isDark]);
  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressRow}>
        {STEP_META.map((step, index) => {
          const isDone = index < current;
          const isCurrent = index === current;
          return (
            <React.Fragment key={step.key}>
              {index > 0 ? (
                <View
                  style={[
                    styles.progressLine,
                    (isDone || isCurrent) && styles.progressLineActive,
                  ]}
                />
              ) : null}
              <View
                accessibilityRole="text"
                accessibilityLabel={`Etapa ${index + 1}: ${step.title}${
                  isDone ? ', concluída' : isCurrent ? ', atual' : ''
                }`}
                style={[
                  styles.progressDot,
                  isCurrent && styles.progressDotCurrent,
                  isDone && styles.progressDotDone,
                ]}
              >
                {isDone ? (
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color={colors.textOnPrimary}
                    accessibilityElementsHidden
                  />
                ) : (
                  <Text
                    style={[
                      styles.progressNumber,
                      isCurrent && styles.progressNumberCurrent,
                    ]}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>
            </React.Fragment>
          );
        })}
      </View>
      <View style={styles.progressCaptionRow}>
        <Ionicons
          name={STEP_META[current].icon as ComponentProps<typeof Ionicons>['name']}
          size={sizes.icon.sm}
          color={colors.primary}
          accessibilityElementsHidden
        />
        <Text style={styles.progressCaption}>
          Etapa {current + 1} de {STEP_META.length} · {STEP_META[current].title}
        </Text>
      </View>
    </View>
  );
}
