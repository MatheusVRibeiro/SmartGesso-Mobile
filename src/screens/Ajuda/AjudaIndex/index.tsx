import React, { useMemo, useState } from 'react';
import { Alert, Linking, Text, TouchableOpacity, View } from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { AppCard } from '@/src/components/ui/AppCard';
import { config } from '@/src/constants/config';
import { companyService } from '@/src/services/api/companies';
import { useSessionStore } from '@/src/store/useSessionStore';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { radius, sizes } from '@/src/theme';
import { createAjudaStyles } from './styles';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'offline',
    question: 'Como funciona o modo offline?',
    answer:
      'O SmartGesso salva orçamentos, fotos e clientes no seu aparelho quando você está sem internet. Assim que a conexão voltar, tudo é sincronizado automaticamente.',
  },
  {
    id: 'pdf',
    question: 'Como compartilhar um orçamento com o cliente?',
    answer:
      'Abra o orçamento desejado e toque no botão "Compartilhar PDF". O documento é gerado na hora e pode ser enviado via WhatsApp, e-mail ou qualquer app de mensagem.',
  },
  {
    id: 'empresa',
    question: 'Como trocar de empresa ou filial?',
    answer:
      'No menu Perfil, toque no seletor de empresa no topo da tela para ver todas as empresas vinculadas à sua conta e alternar entre elas.',
  },
  {
    id: 'fotos',
    question: 'As fotos das obras ocupam muito espaço no celular?',
    answer:
      'Não. O aplicativo compacta as fotos automaticamente antes do envio para economizar dados e espaço de armazenamento no seu dispositivo.',
  },
  {
    id: 'backup',
    question: 'Meus dados estão seguros?',
    answer:
      'Sim. Todos os dados são armazenados na nuvem em servidores seguros com backup diário automático e criptografia ponta a ponta.',
  },
];

const APP_VERSION =
  Constants.expoConfig?.version ?? '1.0.0';

const API_VERSION = config.apiUrl?.includes('/api/v1') ? 'v1' : 'v1';

export default function AjudaIndexScreen() {
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const companyId = useSessionStore((s) => s.activeCompany?.company?.id);
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createAjudaStyles(colors, isDark), [colors, isDark]);

  const { data: branding } = useQuery({
    queryKey: ['company', companyId, 'branding'],
    queryFn: () => companyService.getBranding(),
    enabled: Boolean(companyId),
  });

  const toggleFaq = (id: string) => {
    setOpenFaq((prev) => (prev === id ? null : id));
  };

  const handleContact = async (label: string, url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Não foi possível abrir',
          `Não encontramos um aplicativo para abrir este link de ${label.toLowerCase()}.`,
        );
      }
    } catch {
      Alert.alert(
        'Erro',
        `Ocorreu um erro ao tentar entrar em contato via ${label}.`,
      );
    }
  };

  const whatsappValue = branding?.commercialWhatsapp || '+55 (11) 99999-9999';
  const phoneValue = branding?.commercialPhone || '+55 (11) 4002-8922';
  const emailValue = branding?.commercialEmail || 'suporte@smartgesso.com.br';
  const cleanWhatsapp = whatsappValue.replace(/\D/g, '');
  const cleanPhone = phoneValue.replace(/\D/g, '');

  const contactItems = [
    {
      label: 'WhatsApp',
      value: whatsappValue,
      url: `https://wa.me/${cleanWhatsapp}`,
      icon: 'logo-whatsapp' as IconName,
      iconBackground: colors.successSoft,
      iconColor: colors.success,
    },
    {
      label: 'E-mail',
      value: emailValue,
      url: `mailto:${emailValue}`,
      icon: 'mail-outline' as IconName,
      iconBackground: colors.primarySoft,
      iconColor: colors.primary,
    },
    {
      label: 'Telefone',
      value: phoneValue,
      url: `tel:${cleanPhone}`,
      icon: 'call-outline' as IconName,
      iconBackground: colors.infoSoft,
      iconColor: colors.info,
    },
  ];

  return (
    <ScreenContainer scroll padding keyboard={false}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Text style={styles.title}>Ajuda & Suporte</Text>
        <Text style={styles.subtitle}>
          Tire dúvidas e entre em contato com nossa equipe
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Perguntas frequentes</Text>
        <AppCard shadow="light" radius={radius.lg} style={styles.card}>
          {FAQ_ITEMS.map((item, index, array) => {
            const isOpen = openFaq === item.id;
            return (
              <View key={item.id}>
                <TouchableOpacity
                  onPress={() => toggleFaq(item.id)}
                  style={styles.faqItem}
                  accessibilityRole="button"
                  accessibilityLabel={item.question}
                  accessibilityState={{ expanded: isOpen }}
                >
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  <Ionicons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={sizes.icon.sm}
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
                  color={colors.textSecondary}
                  accessibilityElementsHidden
                />
              </TouchableOpacity>
              {index < array.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))}
        </AppCard>
      </View>

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
