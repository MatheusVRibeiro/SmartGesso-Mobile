import React from 'react';
import Svg, { Path, Rect, Circle, Line, Polyline } from 'react-native-svg';

export interface ActionIconProps {
  size?: number;
  color: string;
}

/**
 * Ícone moderno dual-tone de Orçamento / Proposta Comercial
 */
export const QuickQuoteIcon: React.FC<ActionIconProps> = ({ size = 24, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={color}
      fillOpacity="0.12"
    />
    <Polyline
      points="14 2 14 8 20 8"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line
      x1="16"
      y1="13"
      x2="8"
      y2="13"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line
      x1="16"
      y1="17"
      x2="8"
      y2="17"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Polyline
      points="10 9 9 9 8 9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Ícone moderno dual-tone de Ordem de Serviço / Obra
 */
export const QuickServiceIcon: React.FC<ActionIconProps> = ({ size = 24, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 12l-8.5 8.5a2.12 2.12 0 1 1-3-3L12 9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M17.64 15L22 10.64"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M20.91 3.26l-1.25-1.25a2 2 0 0 0-2.83 0l-1.8 1.8 4.07 4.08 1.8-1.8a2 2 0 0 0 0-2.83z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={color}
      fillOpacity="0.2"
    />
  </Svg>
);

/**
 * Ícone moderno dual-tone de Recebimento Financeiro
 */
export const QuickIncomeIcon: React.FC<ActionIconProps> = ({ size = 24, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="12"
      cy="12"
      r="9"
      stroke={color}
      strokeWidth="2"
      fill={color}
      fillOpacity="0.12"
    />
    <Path
      d="M12 6.5v11"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M15 9.2a2.4 2.4 0 0 0-3-1.2c-1.5 0-2.5 1-2.5 2.2 0 2.2 5 1.5 5 3.8 0 1.2-1 2.2-2.5 2.2a2.8 2.8 0 0 1-2.8-1.5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Ícone moderno dual-tone de Calculadora de Drywall e Gesso
 */
export const QuickCalculatorIcon: React.FC<ActionIconProps> = ({ size = 24, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="4"
      y="2"
      width="16"
      height="20"
      rx="3.5"
      stroke={color}
      strokeWidth="2"
      fill={color}
      fillOpacity="0.08"
    />
    <Rect
      x="7"
      y="5"
      width="10"
      height="4.5"
      rx="1.2"
      stroke={color}
      strokeWidth="1.5"
      fill={color}
      fillOpacity="0.2"
    />
    <Circle cx="8" cy="13" r="1.2" fill={color} />
    <Circle cx="12" cy="13" r="1.2" fill={color} />
    <Circle cx="16" cy="13" r="1.2" fill={color} />
    <Circle cx="8" cy="17" r="1.2" fill={color} />
    <Circle cx="12" cy="17" r="1.2" fill={color} />
    <Circle cx="16" cy="17" r="1.2" fill={color} />
  </Svg>
);

/**
 * Ícone moderno dual-tone de Despesa / Saída
 */
export const QuickExpenseIcon: React.FC<ActionIconProps> = ({ size = 24, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="2"
      y="5"
      width="20"
      height="14"
      rx="3"
      stroke={color}
      strokeWidth="2"
      fill={color}
      fillOpacity="0.1"
    />
    <Line
      x1="2"
      y1="10"
      x2="22"
      y2="10"
      stroke={color}
      strokeWidth="2"
    />
    <Rect
      x="5.5"
      y="13.5"
      width="4"
      height="2.5"
      rx="0.5"
      fill={color}
    />
    <Circle
      cx="16"
      cy="14.8"
      r="1.8"
      stroke={color}
      strokeWidth="1.2"
      fill={color}
      fillOpacity="0.25"
    />
  </Svg>
);
