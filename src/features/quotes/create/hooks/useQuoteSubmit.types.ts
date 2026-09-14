/**
 * SmartGesso Mobile — V5 ETAPA 9: tipos auxiliares do hook de submissão.
 */
import type { AppSnackbarType } from '@/src/components/ui/AppSnackbar';

export interface QuoteSnackbarState {
  type: AppSnackbarType;
  message: string;
}
