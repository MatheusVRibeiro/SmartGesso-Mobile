import React, { useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppInput } from '@/src/components/ui/AppInput';
import { AppSnackbar } from '@/src/components/ui/AppSnackbar';
import type { AppSnackbarType } from '@/src/components/ui/AppSnackbar';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { calculateLocalMaterials } from '@/src/services/api/compositions';
import type { MeasurementApplicationType } from '@/src/types/measurement';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { sizes } from '@/src/theme';
import { formatCurrency, formatNumber } from '@/src/utils/format';
import { haptics } from '@/src/utils/haptics';
import { createCalculadoraStyles } from './styles';

interface ApplicationOption {
  type: MeasurementApplicationType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  defaultMaoDeObra: number;
}

const APPLICATION_OPTIONS: ApplicationOption[] = [
  {
    type: 'DRYWALL',
    label: 'Forro Drywall F530',
    icon: 'grid-outline',
    defaultMaoDeObra: 40,
  },
  {
    type: 'FORRO',
    label: 'Forro Placa 60x60',
    icon: 'square-outline',
    defaultMaoDeObra: 35,
  },
  {
    type: 'PAREDE',
    label: 'Parede Divisória',
    icon: 'browsers-outline',
    defaultMaoDeObra: 50,
  },
  {
    type: 'SANCA',
    label: 'Sanca / Cortineiro',
    icon: 'layers-outline',
    defaultMaoDeObra: 45,
  },
  {
    type: 'OUTRO',
    label: 'Gesso Liso / Outros',
    icon: 'color-palette-outline',
    defaultMaoDeObra: 25,
  },
];

export default function CalculadoraRapidaScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createCalculadoraStyles(colors, isDark), [colors, isDark]);

  const [selectedApp, setSelectedApp] = useState<ApplicationOption>(APPLICATION_OPTIONS[0]);
  const [length, setLength] = useState('4.0');
  const [width, setWidth] = useState('3.5');
  const [height, setHeight] = useState('2.7');
  const [laborPricePerM2, setLaborPricePerM2] = useState(String(selectedApp.defaultMaoDeObra));
  const [marginPct, setMarginPct] = useState('30');
  const [snackbar, setSnackbar] = useState<{
    type: AppSnackbarType;
    message: string;
  } | null>(null);

  const lenNum = parseFloat(length.replace(',', '.')) || 0;
  const widNum = parseFloat(width.replace(',', '.')) || 0;
  const heiNum = parseFloat(height.replace(',', '.')) || 0;
  const laborNum = parseFloat(laborPricePerM2.replace(',', '.')) || 0;
  const marginNum = parseFloat(marginPct.replace(',', '.')) || 0;

  // Cálculo da área e perímetro
  const calculatedArea = useMemo(() => {
    if (selectedApp.type === 'PAREDE') {
      return (lenNum + widNum) * 2 * (heiNum > 0 ? heiNum : 2.7);
    }
    return lenNum * widNum;
  }, [lenNum, widNum, heiNum, selectedApp]);

  const calculatedPerimeter = useMemo(() => {
    return (lenNum + widNum) * 2;
  }, [lenNum, widNum]);

  // Materiais calculados
  const calculationResult = useMemo(() => {
    if (calculatedArea <= 0) return null;
    return calculateLocalMaterials({
      applicationType: selectedApp.type,
      measurements: [
        {
          length: lenNum,
          width: widNum,
          ceilingHeight: heiNum,
          area: calculatedArea,
          perimeter: calculatedPerimeter,
        },
      ],
    });
  }, [calculatedArea, calculatedPerimeter, lenNum, widNum, heiNum, selectedApp]);

  // Totais financeiros
  const materialCost = calculationResult?.estimatedCost ?? 0;
  const laborCost = calculatedArea * laborNum;
  const baseCost = materialCost + laborCost;
  const suggestedSalePrice = marginNum < 100 ? baseCost / (1 - marginNum / 100) : baseCost * 1.3;
  const estimatedProfit = suggestedSalePrice - baseCost;

  const handleSelectApp = (app: ApplicationOption) => {
    setSelectedApp(app);
    setLaborPricePerM2(String(app.defaultMaoDeObra));
  };

  const handleShareEstimateWhatsApp = () => {
    const text = `*Estimativa de Serviço - SmartGesso*
Tipo: ${selectedApp.label}
Área: ${formatNumber(calculatedArea)} m²
Preço Estimado: ${formatCurrency(suggestedSalePrice)}
_Valores aproximados para orçamento prévio._`;

    const url = `whatsapp://send?text=${encodeURI(text)}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          setSnackbar({
            type: 'info',
            message: 'WhatsApp não está instalado neste dispositivo.',
          });
        }
      })
      .catch(() => {
        setSnackbar({
          type: 'error',
          message: 'Erro ao abrir WhatsApp.',
        });
      });
  };

  const handleCreateOfficialQuote = () => {
    router.push({
      pathname: '/orcamentos/novo',
      params: {
        fromCalc: '1',
        calcArea: String(calculatedArea),
        calcPerimeter: String(calculatedPerimeter),
        calcType: selectedApp.type,
      },
    });
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: 'Calculadora Rápida', headerShown: false }} />
      <ScreenContainer scroll padding keyboard>
        <View style={styles.responsiveContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Voltar"
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
            <View style={styles.headerTitleBox}>
              <Text style={styles.title}>Calculadora Rápida</Text>
              <Text style={styles.subtitle}>Estimativa instantânea de materiais e custos</Text>
            </View>
          </View>

          {/* Tipo de Aplicação */}
          <Text style={styles.sectionLabel}>Tipo de Trabalho</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.appsScroll}
          >
            {APPLICATION_OPTIONS.map((app) => {
              const isSelected = selectedApp.type === app.type;
              return (
                <Pressable
                  key={app.type}
                  onPress={() => handleSelectApp(app)}
                  style={[styles.appCard, isSelected && styles.appCardSelected]}
                  accessibilityRole="button"
                  accessibilityLabel={`Selecionar ${app.label}`}
                >
                  <View style={[styles.appIconBox, isSelected && styles.appIconBoxSelected]}>
                    <Ionicons
                      name={app.icon}
                      size={24}
                      color={isSelected ? colors.white : colors.primary}
                    />
                  </View>
                  <Text style={[styles.appLabel, isSelected && styles.appLabelSelected]}>
                    {app.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Medições */}
          <Text style={styles.sectionLabel}>Dimensões do Ambiente</Text>
          <AppCard shadow="light" style={styles.card}>
            <View style={styles.row}>
              <View style={styles.col}>
                <AppInput
                  label="Comprimento (m)"
                  value={length}
                  onChangeText={setLength}
                  placeholder="4.0"
                  keyboardType="decimal-pad"
                  accessibilityLabel="Comprimento em metros"
                />
              </View>
              <View style={styles.col}>
                <AppInput
                  label="Largura (m)"
                  value={width}
                  onChangeText={setWidth}
                  placeholder="3.5"
                  keyboardType="decimal-pad"
                  accessibilityLabel="Largura em metros"
                />
              </View>
              {selectedApp.type === 'PAREDE' ? (
                <View style={styles.col}>
                  <AppInput
                    label="Pé-Direito (m)"
                    value={height}
                    onChangeText={setHeight}
                    placeholder="2.7"
                    keyboardType="decimal-pad"
                    accessibilityLabel="Pé direito em metros"
                  />
                </View>
              ) : null}
            </View>

            {/* Área e Perímetro calculados */}
            <View style={styles.measurementSummary}>
              <View style={styles.measurementItem}>
                <Text style={styles.measurementLabel}>Área Total</Text>
                <Text style={styles.measurementValue}>{formatNumber(calculatedArea)} m²</Text>
              </View>
              <View style={styles.measurementItem}>
                <Text style={styles.measurementLabel}>Perímetro</Text>
                <Text style={styles.measurementValue}>{formatNumber(calculatedPerimeter)} m</Text>
              </View>
            </View>
          </AppCard>

          {/* Valores e Margem */}
          <Text style={styles.sectionLabel}>Mão de Obra e Margem</Text>
          <AppCard shadow="light" style={styles.card}>
            <View style={styles.row}>
              <View style={styles.halfCol}>
                <AppInput
                  label="Mão de Obra (R$/m²)"
                  value={laborPricePerM2}
                  onChangeText={setLaborPricePerM2}
                  placeholder="40"
                  keyboardType="decimal-pad"
                  accessibilityLabel="Valor da mão de obra por metro quadrado"
                />
              </View>
              <View style={styles.halfCol}>
                <AppInput
                  label="Margem de Lucro (%)"
                  value={marginPct}
                  onChangeText={setMarginPct}
                  placeholder="30"
                  keyboardType="decimal-pad"
                  accessibilityLabel="Margem de lucro em porcentagem"
                />
              </View>
            </View>
          </AppCard>

          {/* Card Principal de Preço Sugerido */}
          <AppCard shadow="light" style={styles.resultHeroCard}>
            <View style={styles.heroHeader}>
              <Text style={styles.heroLabel}>Preço de Venda Sugerido</Text>
              <Text style={styles.heroValue}>{formatCurrency(suggestedSalePrice)}</Text>
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.heroDetails}>
              <View style={styles.heroDetailCol}>
                <Text style={styles.heroDetailLabel}>Materiais</Text>
                <Text style={styles.heroDetailValue}>{formatCurrency(materialCost)}</Text>
              </View>
              <View style={styles.heroDetailCol}>
                <Text style={styles.heroDetailLabel}>Mão de Obra</Text>
                <Text style={styles.heroDetailValue}>{formatCurrency(laborCost)}</Text>
              </View>
              <View style={styles.heroDetailCol}>
                <Text style={styles.heroDetailLabel}>Lucro Líquido</Text>
                <Text style={[styles.heroDetailValue, { color: colors.success }]}>
                  {formatCurrency(estimatedProfit)}
                </Text>
              </View>
            </View>
          </AppCard>

          {/* Lista de Materiais Calculados */}
          {calculationResult && calculationResult.items.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Materiais Necessários (com quebra 10%)</Text>
              <AppCard shadow="light" style={styles.materialsCard}>
                {calculationResult.items.map((item, idx) => (
                  <View
                    key={`${item.name}-${idx}`}
                    style={[
                      styles.materialRow,
                      idx < calculationResult.items.length - 1 && styles.materialRowBorder,
                    ]}
                  >
                    <View style={styles.materialInfo}>
                      <Text style={styles.materialName}>{item.name}</Text>
                      <Text style={styles.materialUnitPrice}>
                        {formatCurrency(item.unitPrice ?? 0)} / {item.unit}
                      </Text>
                    </View>
                    <View style={styles.materialQtyCol}>
                      <Text style={styles.materialQty}>
                        {item.quantity} {item.unit}
                      </Text>
                      <Text style={styles.materialTotal}>{formatCurrency(item.total ?? 0)}</Text>
                    </View>
                  </View>
                ))}
              </AppCard>
            </>
          )}

          {/* Ações */}
          <View style={styles.actionButtons}>
            <AppButton
              title="Enviar Estimativa por WhatsApp"
              size="lg"
              variant="primary"
              accessibilityLabel="Compartilhar estimativa pelo WhatsApp"
              onPress={handleShareEstimateWhatsApp}
              style={styles.whatsAppBtn}
            />
            <AppButton
              title="Criar Orçamento Oficial"
              size="lg"
              variant="outline"
              accessibilityLabel="Criar orçamento formal com estes dados"
              onPress={handleCreateOfficialQuote}
              style={styles.officialQuoteBtn}
            />
          </View>
        </View>
      </ScreenContainer>

      {snackbar && (
        <AppSnackbar
          visible={true}
          type={snackbar.type}
          message={snackbar.message}
          onHide={() => setSnackbar(null)}
        />
      )}
    </View>
  );
}
