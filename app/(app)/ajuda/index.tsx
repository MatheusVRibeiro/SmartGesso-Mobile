import React, { useState } from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ScreenContainer } from '../../../src/components/ui/ScreenContainer';
import { AppCard } from '../../../src/components/ui/AppCard';
import { config } from '../../../src/constants/config';
import { companyService } from '../../../src/services/api/companies';
import { useSessionStore } from '../../../src/store/useSessionStore';
import { colors, radius, sizes, spacing, typography } from '../../../src/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

// ─── Dados de contato (fallback — substituídos pelo branding da empresa) ────
const CONTACT_FALLBACK = {
  whatsapp: {
    label: 'WhatsApp',
    value: '+55 (11) 99999-9999',
    url: 'https://wa.me/5511999999999',
    icon: 'logo-whatsapp' as IconName,
    iconBackground: colors.successSoft,
    iconColor: colors.success,
  },
  email: {
    label: 'E-mail',
    value: 'suporte@smartgesso.com.br',
    url: 'mailto:suporte@smartgesso.com.br',
    icon: 'mail-outline' as IconName,
    iconBackground: colors.primarySoft,
    iconColor: colors.primary,
  },
  phone: {
    label: 'Telefone',
    value: '+55 (11) 4002-8922',
    url: 'tel:+551140028922',
    icon: 'call-outline' as IconName,
    iconBackground: colors.infoSoft,
    iconColor: colors.info,
  },
} as const;

// ─── FAQ ────────────────────────────────────────────────────────────────────

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'criar-orcamento',
    question: 'Como criar um orçamento?',
    answer:
      'Acesse a aba Orçamentos e toque em "Novo orçamento". Preencha as etapas: cliente, local, medições, itens de serviço/materiais, valores, prazo e forma de pagamento. Revise os dados e salve — o orçamento ficará com status Pendente até ser aprovado.',
  },
  {
    id: 'aprovar-orcamento',
    question: 'Como aprovar um orçamento?',
    answer:
      'Abra o orçamento com status Pendente e toque em "Aprovar orçamento". Confirme na janela de diálogo — o status muda para Aprovado e o serviço pode ser programado na agenda. Você também pode rejeitar ou duplicar um orçamento pela mesma tela.',
  },
  {
    id: 'registrar-pagamento',
    question: 'Como registrar um pagamento?',
    answer:
      'Acesse a aba Pagamentos e toque em "Novo pagamento". Informe o cliente, o valor recebido, a forma de pagamento (dinheiro, Pix, cartão, boleto ou transferência) e a data. Salve para registrar a entrada no financeiro.',
  },
  {
    id: 'funcionamento-estoque',
    question: 'Como funciona o estoque?',
    answer:
      'O estoque controla a movimentação de materiais pelo catálogo. Registre entradas (compras), saídas (materiais usados nas obras) e ajustes para manter o saldo sempre atualizado. O sistema calcula automaticamente o saldo de cada material.',
  },
];

// ─── Sobre ──────────────────────────────────────────────────────────────────

const APP_VERSION = Constants.expoConfig?.version ?? config.appVersion;
const API_VERSION = config.apiUrl.split('/api/')[1] ?? 'v1';

// ─── Tela ───────────────────────────────────────────────────────────────────

export default function AjudaScreen() {
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const handleContact = async (label: string, url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert('Não foi possível abrir', `Não há um aplicativo disponível para ${label}.`);
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert('Erro', `Não foi possível abrir ${label}. Tente novamente.`);
    }
  };

  const activeCompanyId = useSessionStore((s) => s.activeCompany?.company.id);

  // Contatos reais da empresa ativa (branding) com fallback.
  const { data: branding } = useQuery({
    queryKey: ['company', activeCompanyId, 'branding'],
    queryFn: () => companyService.getBranding(),
    enabled: Boolean(activeCompanyId),
    staleTime: 5 * 60 * 1000,
  });

  const contactItems = [
    branding?.commercialWhatsapp
      ? {
          ...CONTACT_FALLBACK.whatsapp,
          value: branding.commercialWhatsapp,
          url: `https://wa.me/${branding.commercialWhatsapp.replace(/\D/g, '')}`,
        }
      : CONTACT_FALLBACK.whatsapp,
    branding?.commercialEmail
      ? {
          ...CONTACT_FALLBACK.email,
          value: branding.commercialEmail,
          url: `mailto:${branding.commercialEmail}`,
        }
      : CONTACT_FALLBACK.email,
    branding?.commercialPhone
      ? {
          ...CONTACT_FALLBACK.phone,
          value: branding.commercialPhone,
          url: `tel:${branding.commercialPhone.replace(/\D/g, '')}`,
        }
      : CONTACT_FALLBACK.phone,
  ];

  return (
    <ScreenContainer scroll padding keyboard={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Ajuda e Suporte</Text>
        <Text style={styles.subtitle}>
          Tire suas dúvidas, fale com a gente ou conheça a versão do aplicativo.
        </Text>
      </View>

      {/* FAQ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Perguntas frequentes</Text>
        <AppCard shadow="light" radius={radius.lg} style={styles.card}>
          {FAQ_ITEMS.map((item, index, array) => {
            const isOpen = openFaqId === item.id;
            return (
              <View key={item.id}>
                <TouchableOpacity
                  onPress={() => setOpenFaqId(isOpen ? null : item.id)}
                  style={styles.faqHeader}
                  accessibilityRole="button"
                  accessibilityLabel={item.question}
                  accessibilityState={{ expanded: isOpen }}
                >
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  <Ionicons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={sizes.icon.md}
                    color={colors.textSecondary}
                    accessibilityElementsHidden
                  />
                </TouchableOpacity>
                {isOpen ? (
                  <View style={styles.faqAnswerContainer}>
                    <Text style={styles.faqAnswer}>{item.answer}</Text>
                  </View>
                ) : null}
                {index < array.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            );
          })}
        </AppCard>
      </View>

      {/* Contato */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contato</Text>
        <AppCard shadow="light" radius={radius.lg} style={styles.card}>
          {contactItems.map((item, index, array) => (
            <View key={item.label}>
              <TouchableOpacity
                onPress={() => handleContact(item.label, item.url)}
                style={styles.contactItem}
                accessibilityRole="button"
                accessibilityLabel={`${item.label}: ${item.value}`}
              >
                <View style={styles.contactContent}>
                  <View style={[styles.contactIcon, { backgroundColor: item.iconBackground }]}>
                    <Ionicons
                      name={item.icon}
                      size={sizes.icon.md}
                      color={item.iconColor}
                      accessibilityElementsHidden
                    />
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactLabel}>{item.label}</Text>
                    <Text style={styles.contactValue}>{item.value}</Text>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={sizes.icon.md}
                  color={colors.textLight}
                  accessibilityElementsHidden
                />
              </TouchableOpacity>
              {index < array.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))}
        </AppCard>
      </View>

      {/* Sobre */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sobre</Text>
        <AppCard shadow="light" radius={radius.lg} style={styles.card}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Versão do app</Text>
            <Text style={styles.aboutValue}>{APP_VERSION}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Versão da API</Text>
            <Text style={styles.aboutValue}>{API_VERSION}</Text>
          </View>
        </AppCard>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  // FAQ
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: sizes.touchTarget,
  },
  faqQuestion: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  faqAnswerContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  faqAnswer: {
    fontSize: typography.sizes.sm,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  // Contato
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  contactContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  contactValue: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // Sobre
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: sizes.touchTarget,
  },
  aboutLabel: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  aboutValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
});