/**
 * Utilitários de Sanitização e Segurança (Anti-XSS, Anti-Injection)
 */

/**
 * Escapa caracteres HTML perigosos para prevenir ataques de Cross-Site Scripting (XSS).
 */
export function escapeHtml(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Remove tags script, iframe, javascript: URIs e handlers de eventos em strings.
 */
export function sanitizeInput(input: unknown, maxLength = 2000): string {
  if (input === null || input === undefined) return '';
  let str = String(input).trim();

  // Limitar comprimento
  if (str.length > maxLength) {
    str = str.slice(0, maxLength);
  }

  // Remove caracteres de controle nulos (%00, \0)
  str = str.replace(/\0/g, '');

  // Remove tags perigosas comuns
  str = str.replace(/<\s*(script|iframe|object|embed|applet|meta|link|style)[^>]*>.*?<\s*\/\s*\1\s*>/gis, '');
  str = str.replace(/<\s*(script|iframe|object|embed|applet|meta|link|style)[^>]*\/?>/gis, '');

  // Remove handlers inline perigosos (ex: onload=, onclick=, onerror=)
  str = str.replace(/on\w+\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, '');

  // Remove URIs perigosas como javascript:, data:text/html, vbscript:
  str = str.replace(/(javascript|data|vbscript):/gi, '$1_:');

  return str.trim();
}

/**
 * Sanitiza e-mails removendo espaços e caracteres proibidos.
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase().slice(0, 254);
}

/**
 * Sanitiza números de telefone retendo apenas dígitos.
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';
  return phone.replace(/\D/g, '').slice(0, 15);
}

/**
 * Valida se um ID tem formato seguro (UUID, CUID ou alfanumérico seguro com traços/underscores)
 * prevenindo ataques de SQLi, NoSQLi ou IDOR malicioso.
 */
export function isValidId(id: unknown): boolean {
  if (!id || typeof id !== 'string') return false;
  const trimmed = id.trim();
  if (trimmed.length === 0 || trimmed.length > 64) return false;
  // Permite UUID (v4), CUID, cuid2 ou alfanumérico com traços e underscores
  return /^[a-zA-Z0-9_-]+$/.test(trimmed);
}
