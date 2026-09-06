import React from 'react';
import Svg, { Path, Rect, Line, Circle } from 'react-native-svg';

export interface LucideIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export type LucideIconComponent = React.FC<LucideIconProps>;

/**
 * Orçamento: Documento outlined com linhas internas (Padrão de Referência Visual)
 * Bounding Box: 16 x 20 em viewBox 0 0 24 24
 */
export const QuickDocumentIcon: LucideIconComponent = ({
  size = 24,
  color = '#818CF8',
  strokeWidth = 2,
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <Path d="M14 2v6h6" />
    <Line x1="16" y1="13" x2="8" y2="13" />
    <Line x1="16" y1="17" x2="8" y2="17" />
    <Line x1="10" y1="9" x2="8" y2="9" />
  </Svg>
);

/**
 * Nova OS: Chave inglesa calibrada para a mesma área visual
 */
export const QuickWrenchIcon: LucideIconComponent = ({
  size = 24,
  color = '#818CF8',
  strokeWidth = 2,
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </Svg>
);

/**
 * Receber: Círculo com símbolo de cifrão ($) perfeitamente centralizado
 */
export const QuickDollarIcon: LucideIconComponent = ({
  size = 24,
  color = '#818CF8',
  strokeWidth = 2,
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Circle cx="12" cy="12" r="9" />
    <Path d="M15 9.5a2.5 2.5 0 0 0-5 0c0 3 5 2 5 5a2.5 2.5 0 0 1-5 0" />
    <Line x1="12" y1="6.5" x2="12" y2="17.5" />
  </Svg>
);

/**
 * Calculadora: Display superior + botões em grade com proporção 16x20 idêntica ao orçamento
 */
export const QuickCalculatorIcon: LucideIconComponent = ({
  size = 24,
  color = '#818CF8',
  strokeWidth = 2,
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Rect width="16" height="20" x="4" y="2" rx="2" />
    <Line x1="8" x2="16" y1="6" y2="6" />
    <Line x1="16" x2="16" y1="14" y2="18" />
    <Path d="M16 10h.01" />
    <Path d="M12 10h.01" />
    <Path d="M8 10h.01" />
    <Path d="M12 14h.01" />
    <Path d="M8 14h.01" />
    <Path d="M12 18h.01" />
    <Path d="M8 18h.01" />
  </Svg>
);

/**
 * Despesa: Cartão de crédito equilibrado (20x15) para igualar o peso visual do orçamento
 */
export const QuickCreditCardIcon: LucideIconComponent = ({
  size = 24,
  color = '#818CF8',
  strokeWidth = 2,
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Rect width="20" height="15" x="2" y="4.5" rx="2.5" />
    <Line x1="2" x2="22" y1="9.5" y2="9.5" />
    <Line x1="6" x2="10" y1="14.5" y2="14.5" />
  </Svg>
);

/**
 * Novo Cliente: Silhueta de usuário com símbolo de adição (+) alinhado ao padrão visual
 */
export const QuickUserPlusIcon: LucideIconComponent = ({
  size = 24,
  color = '#818CF8',
  strokeWidth = 2,
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <Circle cx="9" cy="7" r="4" />
    <Line x1="19" y1="8" x2="19" y2="14" />
    <Line x1="22" y1="11" x2="16" y2="11" />
  </Svg>
);

/**
 * Nova Produção / Construção: Martelo profissional calibrado
 */
export const QuickHammerIcon: LucideIconComponent = ({
  size = 24,
  color = '#818CF8',
  strokeWidth = 2,
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9" />
    <Path d="m18 15 4-4" />
    <Path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.242-1.758H11" />
    <Path d="m15 12 3 3" />
  </Svg>
);

/**
 * Usuário simples outlined padrão 24x24
 */
export const QuickUserIcon: LucideIconComponent = ({
  size = 24,
  color = '#818CF8',
  strokeWidth = 2,
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

// Aliases para retrocompatibilidade
export {
  QuickDocumentIcon as FileSpreadsheet,
  QuickWrenchIcon as Hammer,
  QuickDollarIcon as CircleDollarSign,
  QuickCalculatorIcon as Calculator,
  QuickCreditCardIcon as Receipt,
  QuickUserPlusIcon as UserPlus,
  QuickHammerIcon as WrenchHammer,
};
