import { useCallback, useRef, useState } from 'react';
import { fetchCompanyByCnpj, sanitizeCnpj, type CnpjCompanyData } from '../services/api/cnpj';
import { haptics } from '../utils/haptics';

export interface UseCnpjLookupReturn {
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  searchCnpj: (
    rawCnpj: string,
    onFound?: (data: CnpjCompanyData) => void,
    force?: boolean
  ) => Promise<CnpjCompanyData | null>;
  handleCnpjChange: (
    text: string,
    onFound: (data: CnpjCompanyData) => void,
    onTextChange?: (text: string) => void
  ) => void;
}

export function useCnpjLookup(): UseCnpjLookupReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastSearchedRef = useRef<string>('');

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const searchCnpj = useCallback(
    async (
      rawCnpj: string,
      onFound?: (data: CnpjCompanyData) => void,
      force = false
    ): Promise<CnpjCompanyData | null> => {
      const clean = sanitizeCnpj(rawCnpj);

      if (clean.length !== 14) {
        return null;
      }

      if (!force && lastSearchedRef.current === clean && !error) {
        return null;
      }

      setIsLoading(true);
      setError(null);
      lastSearchedRef.current = clean;

      try {
        const company = await fetchCompanyByCnpj(clean);

        if (!company) {
          setError('CNPJ não encontrado na Receita Federal');
          haptics.warning();
          return null;
        }

        haptics.success();
        if (onFound) {
          onFound(company);
        }

        return company;
      } catch {
        setError('Não foi possível consultar o CNPJ');
        haptics.warning();
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [error]
  );

  const handleCnpjChange = useCallback(
    (
      text: string,
      onFound: (data: CnpjCompanyData) => void,
      onTextChange?: (text: string) => void
    ) => {
      if (onTextChange) {
        onTextChange(text);
      }

      const clean = sanitizeCnpj(text);
      if (clean.length === 14 && clean !== lastSearchedRef.current) {
        searchCnpj(clean, onFound);
      } else if (clean.length < 14) {
        lastSearchedRef.current = '';
        if (error) setError(null);
      }
    },
    [error, searchCnpj]
  );

  return {
    isLoading,
    error,
    clearError,
    searchCnpj,
    handleCnpjChange,
  };
}
