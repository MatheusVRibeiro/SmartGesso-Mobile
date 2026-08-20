/**
 * Máscaras de entrada com auto-correção (V3 — UX).
 *
 * Todas as funções recebem o texto bruto digitado e retornam o texto
 * formatado. São "auto-corretivas": removem caracteres inválidos e
 * aplicam a máscara progressivamente enquanto o usuário digita.
 */

/** Remove tudo que não é dígito. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * CPF (000.000.000-00) ou CNPJ (00.000.000/0000-00) — escolhe pela
 * quantidade de dígitos (11 = CPF, 14 = CNPJ).
 */
export function formatCpfCnpj(value: string): string {
  const digits = onlyDigits(value).slice(0, 14);
  if (digits.length <= 11) {
    // CPF
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  // CNPJ
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

/** Telefone: (00) 0000-0000 ou (00) 00000-0000 (auto pelo tamanho). */
export function formatPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

/** CEP: 00000-000. */
export function formatCep(value: string): string {
  const digits = onlyDigits(value).slice(0, 8);
  return digits.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
}

/**
 * Moeda com auto-correção: digita apenas números e o valor é formatado
 * como R$ 1.234,56 progressivamente. `0` vira `R$ 0,00`.
 */
export function formatCurrencyInput(value: string): string {
  // Remove tudo que não é dígito (aceita texto já formatado).
  const digits = onlyDigits(value).slice(0, 13);
  if (!digits) return '';
  const cents = parseInt(digits, 10);
  const reais = Math.floor(cents / 100);
  const centavos = cents % 100;
  const reaisStr = reais.toLocaleString('pt-BR');
  return `R$ ${reaisStr},${String(centavos).padStart(2, '0')}`;
}

/** Converte texto formatado como moeda de volta para número (centavos → float). */
export function parseCurrencyInput(value: string): number {
  const digits = onlyDigits(value);
  if (!digits) return 0;
  return parseInt(digits, 10) / 100;
}

export type InputMask = 'cpfCnpj' | 'phone' | 'cep' | 'currency';

/** Aplica a máscara correspondente ao texto digitado. */
export function applyMask(mask: InputMask, value: string): string {
  switch (mask) {
    case 'cpfCnpj':
      return formatCpfCnpj(value);
    case 'phone':
      return formatPhone(value);
    case 'cep':
      return formatCep(value);
    case 'currency':
      return formatCurrencyInput(value);
    default:
      return value;
  }
}

/** KeyboardType recomendado para cada máscara. */
export function maskKeyboardType(
  mask: InputMask,
): 'numeric' | 'number-pad' | 'phone-pad' | undefined {
  switch (mask) {
    case 'cpfCnpj':
      return 'number-pad';
    case 'phone':
      return 'phone-pad';
    case 'cep':
      return 'number-pad';
    case 'currency':
      return 'number-pad';
    default:
      return undefined;
  }
}