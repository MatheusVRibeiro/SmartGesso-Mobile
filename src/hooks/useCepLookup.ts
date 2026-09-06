import { useCallback, useRef, useState } from 'react';
import { fetchAddressByCep, sanitizeCep, type CepAddress } from '../services/api/cep';

export interface UseCepLookupReturn {
  /** Se uma busca de CEP está em andamento */
  isLoading: boolean;
  /** Mensagem de erro caso a consulta falhe ou o CEP não seja encontrado */
  error: string | null;
  /** Limpa o erro atual */
  clearError: () => void;
  /**
   * Executa a busca de endereço para o CEP fornecido.
   * @param rawCep CEP com ou sem formatação.
   * @param onFound Callback executado quando o endereço for encontrado com sucesso.
   */
  searchCep: (
    rawCep: string,
    onFound?: (address: CepAddress) => void,
    force?: boolean
  ) => Promise<CepAddress | null>;
  /**
   * Helper prático para ser passado diretamente no onChangeText do campo de CEP.
   * Executa a busca automaticamente assim que 8 dígitos forem informados.
   */
  handleCepChange: (
    text: string,
    onFound: (address: CepAddress) => void,
    onTextChange?: (text: string) => void
  ) => void;
}

/**
 * Hook para consulta e autocompletion de endereço por CEP.
 */
export function useCepLookup(): UseCepLookupReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastSearchedCepRef = useRef<string>('');

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const searchCep = useCallback(
    async (
      rawCep: string,
      onFound?: (address: CepAddress) => void,
      force = false
    ): Promise<CepAddress | null> => {
      const clean = sanitizeCep(rawCep);

      if (clean.length !== 8) {
        return null;
      }

      // Evita requisição duplicada para o mesmo CEP a não ser que seja forçada
      if (!force && lastSearchedCepRef.current === clean && !error) {
        return null;
      }

      setIsLoading(true);
      setError(null);
      lastSearchedCepRef.current = clean;

      try {
        const address = await fetchAddressByCep(clean);

        if (!address) {
          setError('CEP não encontrado');
          return null;
        }

        if (onFound) {
          onFound(address);
        }

        return address;
      } catch {
        setError('Não foi possível buscar o CEP');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [error]
  );

  const handleCepChange = useCallback(
    (
      text: string,
      onFound: (address: CepAddress) => void,
      onTextChange?: (text: string) => void
    ) => {
      if (onTextChange) {
        onTextChange(text);
      }

      const clean = sanitizeCep(text);
      if (clean.length === 8 && clean !== lastSearchedCepRef.current) {
        searchCep(clean, onFound);
      } else if (clean.length < 8) {
        lastSearchedCepRef.current = '';
        if (error) setError(null);
      }
    },
    [error, searchCep]
  );

  return {
    isLoading,
    error,
    clearError,
    searchCep,
    handleCepChange,
  };
}
