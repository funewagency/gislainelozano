/**
 * Utilitário de formatação de telefone brasileiro para formulários.
 * Suporta telefones fixos (10 dígitos) e celulares (11 dígitos).
 */

export function formatBrazilianPhone(value: string): string {
  if (!value) return '';
  let digits = value.replace(/\D/g, '');

  // Trata prefixo internacional do Brasil (+55) se colado junto
  if (digits.length > 11 && digits.startsWith('55')) {
    digits = digits.slice(2);
  }

  // Limita ao máximo de 11 dígitos (DDD + 9 dígitos)
  digits = digits.slice(0, 11);

  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
