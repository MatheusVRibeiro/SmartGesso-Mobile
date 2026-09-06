import React from 'react';
import Svg, { Path, Rect, Line, Circle } from 'react-native-svg';

export interface LucideIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export type LucideIconComponent = React.FC<LucideIconProps>;

/**
 * Lucide: FileSpreadsheet (Orçamento)
 */
export const FileSpreadsheet: LucideIconComponent = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2.2,
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
    <Path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
    <Path d="M14 2v5a1 1 0 0 0 1 1h5" />
    <Path d="M8 13h2" />
    <Path d="M14 13h2" />
    <Path d="M8 17h2" />
    <Path d="M14 17h2" />
  </Svg>
);

/**
 * Lucide: Hammer (Nova OS)
 */
export const Hammer: LucideIconComponent = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2.2,
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
    <Path d="m15 12-9.373 9.373a1 1 0 0 1-3.001-3L12 9" />
    <Path d="m18 15 4-4" />
    <Path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172v-.344a2 2 0 0 0-.586-1.414l-1.657-1.657A6 6 0 0 0 12.516 3H9l1.243 1.243A6 6 0 0 1 12 8.485V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5" />
  </Svg>
);

/**
 * Lucide: CircleDollarSign (Receber)
 */
export const CircleDollarSign: LucideIconComponent = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2.2,
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
 * Lucide: Calculator (Calculadora)
 */
export const Calculator: LucideIconComponent = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2.2,
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
 * Lucide: Receipt (Despesa)
 */
export const Receipt: LucideIconComponent = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2.2,
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
    <Path d="M12 17V7" />
    <Path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8" />
    <Path d="M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z" />
  </Svg>
);
