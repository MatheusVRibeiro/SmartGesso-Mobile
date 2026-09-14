/**
 * SmartGesso Mobile — Tokens de cor.
 *
 * Design System gerado por ui-ux-pro-max (Enterprise SaaS Mobile):
 * - Light: Indigo Enterprise (#1E40AF primary) + Green profit accent
 * - Dark: Linear Dark (cinzas neutros #1A1B1E, indigo suave #5E6AD2)
 * Contraste WCAG AA+ em ambos os modos.
 */
export const colors = {
  // Marca — Indigo Enterprise (ui-ux-pro-max)
  primary: '#1E40AF',
  primaryDark: '#1E3A8A',
  primaryLight: '#3B82F6',
  primarySoft: '#EFF6FF',

  // Secundária — Blue
  secondary: '#3B82F6',
  secondaryDark: '#2563EB',
  secondaryLight: '#60A5FA',

  // Semânticos
  success: '#059669',
  successSoft: '#ECFDF5',
  danger: '#DC2626',
  dangerSoft: '#FEF2F2',
  /** Alias de compatibilidade */
  error: '#DC2626',
  warning: '#D97706',
  warningSoft: '#FFFBEB',
  info: '#3B82F6',
  infoSoft: '#EFF6FF',

  // Fundos e superfícies (Light)
  background: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  // Texto (Slate Escuro — contraste 4.5:1+)
  text: '#0F172A',
  textSecondary: '#64748B',
  // textLight (hints, metadados): #66707D garante >=4.5:1 sobre #FFF e #F8FAFC (WCAG AA)
  textLight: '#66707D',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#FFFFFF',

  // Bordas e divisores
  border: '#E2E8F0',
  divider: '#F1F5F9',

  // Inputs
  inputBackground: '#FFFFFF',
  inputBorder: '#CBD5E1',
  inputFocus: '#1E40AF',

  // Estados desabilitados
  disabled: '#94A3B8',
  disabledBackground: '#F1F5F9',
  disabledText: '#64748B',

  // Utilitários
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  focusRing: 'rgba(30, 64, 175, 0.15)',
  overlay: 'rgba(15, 23, 42, 0.55)',

  // Gráficos (Evolução Financeira) — tokens semânticos p/ eliminar hex nas telas
  chartRevenue: '#2563EB',
  chartExpense: '#E11D48',
  kpiBadgePurple: '#F3E8FF',
  kpiBadgePurpleIcon: '#9333EA',
  kpiBadgeDanger: '#FEE2E2',

  // Status de OS (badge bg/text/dot) — light
  statusOsWarningBg: '#FEF3C7',
  statusOsWarningText: '#92400E',
  statusOsInfoBg: '#DBEAFE',
  statusOsInfoText: '#1E40AF',
  statusOsProgressBg: '#E0E7FF',
  statusOsProgressText: '#3730A3',
  statusOsPausedBg: '#FFEDD5',
  statusOsPausedText: '#9A3412',
  statusOsSuccessBg: '#D1FAE5',
  statusOsSuccessText: '#065F46',
  statusOsNeutralBg: '#F3F4F6',
  statusOsNeutralText: '#4B5563',

  // Dots de status de OS (ServicoDetalhe — pill de status atual)
  infoDot: '#3B82F6',
  progressDot: '#6366F1',
  warningDot: '#F59E0B',
  pausedDot: '#F97316',
  successDot: '#10B981',

  // WhatsApp (botões de contato rápido)
  whatsappSoftBg: '#DCFCE7',
  whatsappSoftBorder: '#BBF7D0',
  whatsappDotLight: '#15803D',
  whatsappDotDark: '#4ADE80',

  // Badges KPI — fundo claro sólido / dark translúcido (mesma função, por tema)
  primaryBadge: '#DBEAFE',
  successBadge: '#D1FAE5',
  warningBadge: '#FEF3C7',
  warningBorder: '#FDE68A',
  warningText: '#92400E',
  warningTextStrong: '#B45309',

  // Status de orçamento / acentos vivos (valor constante nos dois temas)
  warningLight: '#FBBF24',
  dangerLight: '#F87171',
  dangerBright: '#EF4444',
  chartSuccess: '#34D399',
  whatsapp: '#25D366',
  whatsappStrong: '#16A34A',

  // Superfícies e acentos de tela
  surfaceRaised: '#FFFFFF',
  avatarBackground: '#EFF6FF',
  avatarBorder: '#DBEAFE',
  iconAccent: '#1E40AF',
  textAction: '#334155',

  // Botão editar orçamento (bg/borda/texto por tema)
  editActionBg: '#EFF6FF',
  editActionBorder: '#2563EB',
  editActionText: '#1D4ED8',

  // Follow-up WhatsApp (bg/borda/texto por tema)
  followUpBg: '#ECFDF5',
  followUpBorder: '#A7F3D0',
  followUpText: '#059669',

  // Ações destrutivas (borda do botão apagar)
  dangerBorder: '#FCA5A5',

  // ─── Dark Mode (Linear Dark — ui-ux-pro-max) ─────────────────────────
  dark: {
    primary: '#5E6AD2',
    primaryDark: '#4C55B0',
    primaryLight: '#8B93E6',
    primarySoft: 'rgba(94, 106, 210, 0.12)',
    secondary: '#5E6AD2',
    secondaryDark: '#4C55B0',
    secondaryLight: '#8B93E6',
    success: '#5FA58C',
    successSoft: 'rgba(95, 165, 140, 0.12)',
    danger: '#F07171',
    dangerSoft: 'rgba(240, 113, 113, 0.12)',
    error: '#F07171',
    warning: '#F5C366',
    warningSoft: 'rgba(245, 195, 102, 0.12)',
    info: '#5E6AD2',
    infoSoft: 'rgba(94, 106, 210, 0.12)',
    background: '#1A1B1E',
    surface: '#222326',
    card: '#222326',
    text: '#F7F8F8',
    textSecondary: '#A6A8AC',
    // textLight dark: #9CA3AF garante >=4.5:1 sobre #1A1B1E/#222326 (era 3.8:1)
    textLight: '#9CA3AF',
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#FFFFFF',
    border: '#2E2F33',
    divider: '#2A2B2F',
    inputBackground: '#222326',
    inputBorder: '#3A3B3F',
    inputFocus: '#5E6AD2',
    disabled: '#76787D',
    disabledBackground: '#2A2B2F',
    disabledText: '#76787D',
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
    focusRing: 'rgba(94, 106, 210, 0.25)',
    overlay: 'rgba(0, 0, 0, 0.6)',

    // Gráficos (Evolução Financeira) — variantes dark mais claras p/ contraste
    chartRevenue: '#60A5FA',
    chartExpense: '#F87171',
    kpiBadgePurple: 'rgba(168, 85, 247, 0.18)',
    kpiBadgePurpleIcon: '#C084FC',
    kpiBadgeDanger: 'rgba(248, 113, 113, 0.18)',

    // Badges KPI — variantes dark translúcidas
    primaryBadge: 'rgba(59, 130, 246, 0.2)',
    successBadge: 'rgba(16, 185, 129, 0.2)',
    warningBadge: 'rgba(245, 158, 11, 0.2)',
    warningBorder: 'rgba(217, 119, 6, 0.4)',
    warningText: '#FCD34D',
    warningTextStrong: '#FDE68A',

    // Status de orçamento / acentos vivos
    warningLight: '#FBBF24',
    dangerLight: '#F87171',
    dangerBright: '#EF4444',
    chartSuccess: '#34D399',
    whatsapp: '#25D366',
    whatsappStrong: '#16A34A',

    // Superfícies e acentos de tela
    surfaceRaised: '#1C1F28',
    avatarBackground: '#1E293B',
    avatarBorder: '#334155',
    iconAccent: '#818CF8',
    textAction: '#F1F5F9',

    // Botão editar orçamento (bg/borda/texto por tema)
    editActionBg: 'rgba(59, 130, 246, 0.15)',
    editActionBorder: '#3B82F6',
    editActionText: '#60A5FA',

    // Follow-up WhatsApp (bg/borda/texto por tema)
    followUpBg: 'rgba(37, 211, 102, 0.15)',
    followUpBorder: 'rgba(37, 211, 102, 0.3)',
    followUpText: '#34D399',

    // Ações destrutivas (borda do botão apagar)
    dangerBorder: 'rgba(239, 68, 68, 0.25)',

    // Status de OS (badge bg/text/dot) — variantes dark translúcidas/claras
    statusOsWarningBg: 'rgba(245, 158, 11, 0.15)',
    statusOsWarningText: '#FBBF24',
    statusOsInfoBg: 'rgba(59, 130, 246, 0.15)',
    statusOsInfoText: '#60A5FA',
    statusOsProgressBg: 'rgba(99, 102, 241, 0.15)',
    statusOsProgressText: '#818CF8',
    statusOsPausedBg: 'rgba(249, 115, 22, 0.15)',
    statusOsPausedText: '#FB923C',
    statusOsSuccessBg: 'rgba(16, 185, 129, 0.15)',
    statusOsSuccessText: '#34D399',
    statusOsNeutralBg: 'rgba(107, 114, 128, 0.15)',
    statusOsNeutralText: '#9CA3AF',

    // Dots de status de OS (ServicoDetalhe — pill de status atual)
    infoDot: '#60A5FA',
    progressDot: '#818CF8',
    warningDot: '#FBBF24',
    pausedDot: '#FB923C',
    successDot: '#34D399',

    // WhatsApp (botões de contato rápido)
    whatsappSoftBg: 'rgba(37, 211, 102, 0.12)',
    whatsappSoftBorder: 'rgba(37, 211, 102, 0.25)',
    whatsappDotLight: '#4ADE80',
    whatsappDotDark: '#4ADE80',
  },
} as const;

export type Colors = typeof colors;
export type ColorName = keyof Colors;
export type DarkColors = typeof colors.dark;
