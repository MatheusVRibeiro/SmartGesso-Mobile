import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, ThemeMode } from '@/src/theme/ThemeProvider';
import { radius, spacing } from '@/src/theme';

interface ThemeSelectorProps {
  style?: object;
}

export function ThemeSelector({ style }: ThemeSelectorProps) {
  const { mode, colors, setMode } = useAppTheme();

  const options: { id: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'light', label: 'Claro', icon: 'sunny-outline' },
    { id: 'dark', label: 'Escuro', icon: 'moon-outline' },
    { id: 'system', label: 'Sistema', icon: 'phone-portrait-outline' },
  ];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
        style,
      ]}
    >
      <View style={styles.header}>
        <Ionicons name="color-palette-outline" size={18} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Aparência do Aplicativo</Text>
      </View>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Escolha o tema de sua preferência ou sincronize com o sistema.
      </Text>

      <View style={[styles.optionsRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
        {options.map((opt) => {
          const isSelected = mode === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              activeOpacity={0.8}
              onPress={() => setMode(opt.id)}
              style={[
                styles.optionBtn,
                isSelected && {
                  backgroundColor: colors.surface,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.12,
                  shadowRadius: 6,
                  elevation: 2,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Tema ${opt.label}`}
              accessibilityState={{ selected: isSelected }}
            >
              <Ionicons
                name={opt.icon}
                size={18}
                color={isSelected ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.optionText,
                  {
                    color: isSelected ? colors.primary : colors.textSecondary,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginBottom: spacing.md,
  },
  optionsRow: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 4,
  },
  optionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.sm,
    minHeight: 44,
  },
  optionText: {
    fontSize: 13,
  },
});

export default ThemeSelector;
