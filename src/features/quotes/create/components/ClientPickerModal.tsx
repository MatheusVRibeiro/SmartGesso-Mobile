/**
 * SmartGesso Mobile — V5 ETAPA 9: modal de seleção de cliente do wizard de
 * orçamento. Extraído verbatim do monólito
 * src/screens/Orcamentos/NovoOrcamento/index.tsx — zero mudança de comportamento.
 */
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppInput } from '@/src/components/ui/AppInput';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { sizes } from '@/src/theme';
import { createWizardStyles } from '../wizardStyles';
import type { Client } from '../types';

export interface ClientPickerModalProps {
  visible: boolean;
  clients: Client[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  onRetry: () => void;
  onSelect: (clientId: string) => void;
  onQuickCreate: () => void;
  onClose: () => void;
}

export function ClientPickerModal({
  visible,
  clients,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onSelect,
  onQuickCreate,
  onClose,
}: ClientPickerModalProps) {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createWizardStyles(colors, isDark), [colors, isDark]);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter((client) =>
      client.name.toLowerCase().includes(term),
    );
  }, [clients, search]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Selecionar cliente</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar seleção de cliente"
            onPress={onClose}
            hitSlop={8}
            style={styles.modalClose}
          >
            <Ionicons name="close" size={sizes.icon.lg} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.modalSearch}>
          <AppInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar cliente..."
            accessibilityLabel="Buscar cliente"
            returnKeyType="search"
          />
        </View>

        <View style={styles.modalBody}>
          {isLoading ? (
            <LoadingState text="Carregando clientes..." />
          ) : isError ? (
            <ErrorState message={errorMessage} onRetry={onRetry} />
          ) : filtered.length === 0 ? (
            <EmptyState
              title={
                search.trim()
                  ? 'Nenhum cliente encontrado'
                  : 'Nenhum cliente cadastrado'
              }
              description={
                search.trim()
                  ? 'Tente buscar com outro termo'
                  : 'Cadastre um cliente rapidamente para continuar'
              }
              icon="people-outline"
            />
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalList}
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Selecionar cliente ${item.name}`}
                  onPress={() => onSelect(item.id)}
                  style={({ pressed }) => [
                    styles.clientOption,
                    pressed && styles.clientOptionPressed,
                  ]}
                >
                  <View style={styles.clientOptionIcon}>
                    <Ionicons
                      name="person-outline"
                      size={sizes.icon.md}
                      color={colors.primary}
                      accessibilityElementsHidden
                    />
                  </View>
                  <View style={styles.clientOptionInfo}>
                    <Text style={styles.clientOptionName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    {item.document ? (
                      <Text style={styles.clientOptionMeta} numberOfLines={1}>
                        {item.document}
                      </Text>
                    ) : null}
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={sizes.icon.md}
                    color={colors.textLight}
                    accessibilityElementsHidden
                  />
                </Pressable>
              )}
            />
          )}
        </View>

        <View style={styles.modalFooter}>
          <AppButton
            title="+ Novo cliente"
            variant="outline"
            size="md"
            accessibilityLabel="Cadastrar novo cliente"
            onPress={onQuickCreate}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}
