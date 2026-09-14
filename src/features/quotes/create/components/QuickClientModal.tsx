/**
 * SmartGesso Mobile — V5 ETAPA 9: modal de cadastro rápido de cliente
 * (V3 §12) do wizard de orçamento. Extraído verbatim do monólito
 * src/screens/Orcamentos/NovoOrcamento/index.tsx — zero mudança de comportamento.
 */
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppInput } from '@/src/components/ui/AppInput';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { sizes } from '@/src/theme';
import { createWizardStyles } from '../wizardStyles';
import type { CreateClientInput } from '../types';

export interface QuickClientModalProps {
  visible: boolean;
  loading: boolean;
  onSave: (data: CreateClientInput) => void;
  onClose: () => void;
}

interface QuickClientErrors {
  name?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
}

/**
 * Cadastro mínimo (nome/telefone/WhatsApp obrigatórios) sem abandonar o
 * wizard — CPF/CNPJ, e-mail e endereço ficam opcionais (V3 §12).
 */
export function QuickClientModal({ visible, loading, onSave, onClose }: QuickClientModalProps) {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createWizardStyles(colors, isDark), [colors, isDark]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [document, setDocument] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [errors, setErrors] = useState<QuickClientErrors>({});

  // Reinicia o formulário sempre que o modal abre.
  useEffect(() => {
    if (!visible) return;
    setName('');
    setPhone('');
    setWhatsapp('');
    setDocument('');
    setEmail('');
    setStreet('');
    setNumber('');
    setNeighborhood('');
    setCity('');
    setState('');
    setZipCode('');
    setErrors({});
  }, [visible]);

  function handleSave() {
    const nextErrors: QuickClientErrors = {};
    if (!name.trim()) nextErrors.name = 'Nome é obrigatório';
    if (!phone.trim()) nextErrors.phone = 'Telefone é obrigatório';
    if (!whatsapp.trim()) nextErrors.whatsapp = 'WhatsApp é obrigatório';
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      nextErrors.email = 'E-mail inválido';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const address = { zipCode, street, number, neighborhood, city, state };
    const hasAddress = Object.values(address).some((v) => v.trim() !== '');
    onSave({
      type: 'FISICA',
      name: name.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim(),
      document: document.trim() || undefined,
      email: email.trim() || undefined,
      ...(hasAddress
        ? {
            address: {
              zipCode: zipCode.trim() || undefined,
              street: street.trim() || undefined,
              number: number.trim() || undefined,
              neighborhood: neighborhood.trim() || undefined,
              city: city.trim() || undefined,
              state: state.trim() || undefined,
            },
          }
        : {}),
    });
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Novo cliente</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar cadastro rápido de cliente"
            onPress={onClose}
            hitSlop={8}
            style={styles.modalClose}
          >
            <Ionicons name="close" size={sizes.icon.lg} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.quickForm}
        >
          <Text style={styles.quickFormHint}>
            Cadastro mínimo para continuar — os demais campos podem ser
            preenchidos depois.
          </Text>

          <AppInput
            label="Nome"
            required
            value={name}
            onChangeText={setName}
            placeholder="Ex.: João da Silva"
            error={errors.name}
            accessibilityLabel="Nome do cliente"
          />
          <AppInput
            label="Telefone"
            required
            value={phone}
            onChangeText={setPhone}
            placeholder="(11) 99999-9999"
            keyboardType="phone-pad"
            error={errors.phone}
            accessibilityLabel="Telefone do cliente"
          />
          <AppInput
            label="WhatsApp"
            required
            value={whatsapp}
            onChangeText={setWhatsapp}
            placeholder="(11) 99999-9999"
            keyboardType="phone-pad"
            error={errors.whatsapp}
            accessibilityLabel="WhatsApp do cliente"
          />
          <AppInput
            label="CPF/CNPJ"
            value={document}
            onChangeText={setDocument}
            placeholder="Opcional"
            accessibilityLabel="CPF ou CNPJ do cliente"
          />
          <AppInput
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="Opcional"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            accessibilityLabel="E-mail do cliente"
          />

          <Text style={styles.quickFormSection}>Endereço (opcional)</Text>
          <View style={styles.quickFormRow}>
            <View style={styles.quickFormFieldHalf}>
              <AppInput
                label="Rua"
                value={street}
                onChangeText={setStreet}
                placeholder="Ex.: Rua das Flores"
                accessibilityLabel="Rua do cliente"
              />
            </View>
            <View style={styles.quickFormFieldHalf}>
              <AppInput
                label="Número"
                value={number}
                onChangeText={setNumber}
                placeholder="Ex.: 123"
                accessibilityLabel="Número do endereço"
              />
            </View>
          </View>
          <View style={styles.quickFormRow}>
            <View style={styles.quickFormFieldHalf}>
              <AppInput
                label="Bairro"
                value={neighborhood}
                onChangeText={setNeighborhood}
                placeholder="Opcional"
                accessibilityLabel="Bairro do cliente"
              />
            </View>
            <View style={styles.quickFormFieldHalf}>
              <AppInput
                label="Cidade"
                value={city}
                onChangeText={setCity}
                placeholder="Opcional"
                accessibilityLabel="Cidade do cliente"
              />
            </View>
          </View>
          <View style={styles.quickFormRow}>
            <View style={styles.quickFormFieldHalf}>
              <AppInput
                label="UF"
                value={state}
                onChangeText={setState}
                placeholder="SP"
                maxLength={2}
                autoCapitalize="characters"
                accessibilityLabel="UF do cliente"
              />
            </View>
            <View style={styles.quickFormFieldHalf}>
              <AppInput
                label="CEP"
                value={zipCode}
                onChangeText={setZipCode}
                mask="cep"
                placeholder="00000-000"
                accessibilityLabel="CEP do cliente"
              />
            </View>
          </View>

          <AppButton
            title="Salvar cliente"
            size="lg"
            onPress={handleSave}
            loading={loading}
            disabled={loading}
            accessibilityLabel="Salvar novo cliente"
            style={styles.quickFormSubmit}
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
