import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppInput } from '@/src/components/ui/AppInput';
import { AppSnackbar } from '@/src/components/ui/AppSnackbar';
import type { AppSnackbarType } from '@/src/components/ui/AppSnackbar';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { colors } from '@/src/theme';
import { createNovoEventoStyles } from './styles';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type EventType = 'VISITA' | 'MEDICAO' | 'INSTALACAO' | 'OUTRO';

const EVENT_TYPES: Array<{ id: EventType; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { id: 'VISITA', label: 'Visita Técnica', icon: 'eye-outline' },
  { id: 'MEDICAO', label: 'Medição', icon: 'resize-outline' },
  { id: 'INSTALACAO', label: 'Instalação', icon: 'hammer-outline' },
  { id: 'OUTRO', label: 'Outro', icon: 'calendar-outline' },
];

export default function NovoEventoScreen() {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createNovoEventoStyles(colors, isDark), [colors, isDark]);
  const router = useRouter();
  const [eventType, setEventType] = useState<EventType>('VISITA');
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [snackbar, setSnackbar] = useState<{ visible: boolean; type: AppSnackbarType; message: string }>({
    visible: false,
    type: 'info',
    message: '',
  });

  const handleSave = () => {
    if (!clientName.trim()) {
      setSnackbar({ visible: true, type: 'error', message: 'Informe o nome do cliente ou obra.' });
      return;
    }
    setSnackbar({ visible: true, type: 'success', message: 'Evento agendado com sucesso!' });
    setTimeout(() => {
      router.back();
    }, 1000);
  };

  return (
    <ScreenContainer scroll style={styles.screen}>
      <Stack.Screen options={{ title: 'Novo Agendamento', headerBackTitle: 'Voltar' }} />

      <Text style={styles.sectionTitle}>Tipo de Evento</Text>
      <View style={styles.typesGrid}>
        {EVENT_TYPES.map((t) => {
          const selected = eventType === t.id;
          return (
            <Pressable
              key={t.id}
              style={[styles.typeCard, selected && styles.typeCardSelected]}
              onPress={() => setEventType(t.id)}
            >
              <Ionicons
                name={t.icon}
                size={20}
                color={selected ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.typeLabel, selected && styles.typeLabelSelected]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <AppCard style={styles.card}>
        <AppInput
          label="Cliente / Obra"
          placeholder="Ex: João da Silva / Edifício Horizonte"
          value={clientName}
          onChangeText={setClientName}
        />
        <AppInput
          label="Data (DD/MM/AAAA)"
          placeholder="DD/MM/AAAA"
          value={date}
          onChangeText={setDate}
        />
        <AppInput
          label="Horário"
          placeholder="Ex: 14:30"
          value={time}
          onChangeText={setTime}
        />
        <AppInput
          label="Observações / Detalhes"
          placeholder="Instruções ou observações adicionais..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />
      </AppCard>

      <AppButton
        title="Salvar Agendamento"
        variant="primary"
        onPress={handleSave}
        style={{ marginTop: 16 }}
      />

      <AppSnackbar
        visible={snackbar.visible}
        type={snackbar.type}
        message={snackbar.message}
        onHide={() => setSnackbar(s => ({ ...s, visible: false }))}
      />
    </ScreenContainer>
  );
}
