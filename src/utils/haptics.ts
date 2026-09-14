import { Platform, Vibration } from 'react-native';

/**
 * Utilitário de feedback tátil / háptico para interações da aplicação.
 * Funciona nativamente em iOS, Android e Web com vibrações sutis.
 */
export const haptics = {
  /** Toque leve para cliques em botões, abas e chips de filtro */
  selection() {
    try {
      if (Platform.OS === 'android') {
        Vibration.vibrate(10);
      } else if (Platform.OS === 'ios') {
        Vibration.vibrate();
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }
    } catch {
      // Falha silenciosa em navegadores/dispositivos sem suporte a vibração
    }
  },

  /** Feedback de impacto médio para ações como adicionar item, trocar de etapa */
  impact() {
    try {
      if (Platform.OS === 'android') {
        Vibration.vibrate(20);
      } else if (Platform.OS === 'ios') {
        Vibration.vibrate();
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(20);
      }
    } catch {
      // Silencioso
    }
  },

  /** Feedback de sucesso para ações concluídas (orçamento aprovado, pagamento registrado) */
  success() {
    try {
      if (Platform.OS === 'android') {
        Vibration.vibrate([0, 15, 60, 25]);
      } else if (Platform.OS === 'ios') {
        Vibration.vibrate();
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([15, 60, 25]);
      }
    } catch {
      // Silencioso
    }
  },

  /** Feedback de erro ou alerta para validações e exclusões */
  warning() {
    try {
      if (Platform.OS === 'android') {
        Vibration.vibrate([0, 30, 80, 40]);
      } else if (Platform.OS === 'ios') {
        Vibration.vibrate();
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([30, 80, 40]);
      }
    } catch {
      // Silencioso
    }
  },
};
