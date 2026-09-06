import React from 'react';
import Svg, { Path, Rect, Line, Circle } from 'react-native-svg';

export interface LucideIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export type LucideIconComponent = React.FC<LucideIconProps>;

/**
 * Orçamento: Documento outlined com linhas internas e dobra superior
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
 * Nova OS: Chave inglesa clássica 45 graus
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
 * Receber: Círculo com símbolo de cifrão ($)
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
    <Circle cx="12" cy="12" r="10" />
    <Path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
    <Path d="M12 18V6" />
  </Svg>
);

/**
 * Calculadora: Display superior + botões em grade
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
 * Despesa: Cartão de crédito com tarja magnética e chip
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
    <Rect width="20" height="14" x="2" y="5" rx="2" />
    <Line x1="2" x2="22" y1="10" y2="10" />
    <Line x1="6" x2="10" y1="15" y2="15" />
  </Svg>
);

// Aliases para retrocompatibilidade
export {
  QuickDocumentIcon as FileSpreadsheet,
  QuickWrenchIcon as Hammer,
  QuickDollarIcon as CircleDollarSign,
  QuickCalculatorIcon as Calculator,
  QuickCreditCardIcon as Receipt,
};
