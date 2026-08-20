/**
 * Utilitários de Segurança para Upload e Manipulação de Arquivos
 */

// Assinaturas binárias (Magic Bytes) para tipos de imagem permitidos
const MAGIC_NUMBERS: Record<string, number[][]> = {
  'image/jpeg': [
    [0xff, 0xd8, 0xff], // JPEG / JPG
  ],
  'image/png': [
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], // PNG
  ],
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
  ],
  'image/webp': [
    [0x52, 0x49, 0x46, 0x46], // RIFF header (seguido de WEBP)
  ],
  'image/avif': [
    [0x00, 0x00, 0x00], // ftyp box (ftypavif / ftypmif1)
  ],
};

// Nomes de arquivo reservados no Windows
const WINDOWS_RESERVED_NAMES = new Set([
  'CON', 'PRN', 'AUX', 'NUL',
  'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
  'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9',
]);

// Extensões de arquivos estritamente proibidas
const BLOCKED_EXTENSIONS = new Set([
  'php', 'phtml', 'php3', 'php4', 'php5', 'phps', 'phar',
  'exe', 'bat', 'cmd', 'sh', 'bash', 'bin', 'msi', 'com', 'scr', 'vbs', 'js', 'ts',
  'py', 'rb', 'pl', 'cgi', 'asp', 'aspx', 'jsp', 'htm', 'html', 'shtml', 'svg',
  'xml', 'htaccess', 'htpasswd', 'ini', 'config', 'dll', 'so', 'dylib',
]);

/**
 * Valida se o buffer corresponde à assinatura mágica do MIME type alegado.
 */
export function validateImageMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (!buffer || buffer.length < 12) return false;

  const signatures = MAGIC_NUMBERS[mimeType];
  if (!signatures) return false;

  for (const sig of signatures) {
    let match = true;
    for (let i = 0; i < sig.length; i++) {
      if (buffer[i] !== sig[i]) {
        match = false;
        break;
      }
    }
    if (match) {
      // Para WebP, verificar também se contém os bytes 'WEBP' nas posições 8 a 11
      if (mimeType === 'image/webp') {
        const webpTag = buffer.subarray(8, 12).toString('ascii');
        return webpTag === 'WEBP';
      }
      return true;
    }
  }

  return false;
}

/**
 * Sanitiza o nome do arquivo contra Path Traversal, caracteres nulos e nomes reservados.
 */
export function sanitizeSafeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return `upload-${Date.now()}`;
  }

  // Remove caracteres nulos
  let clean = filename.replace(/\0/g, '');

  // Pega apenas a base do arquivo (sem diretórios)
  clean = clean.split(/[/\\]/).pop() || 'file';

  // Remove tentativas de directory traversal restantes
  clean = clean.replace(/\.\.+/g, '');

  // Separa nome da extensão
  const lastDot = clean.lastIndexOf('.');
  let baseName = lastDot !== -1 ? clean.slice(0, lastDot) : clean;
  let ext = lastDot !== -1 ? clean.slice(lastDot + 1).toLowerCase() : '';

  // Bloqueia extensões proibidas
  if (BLOCKED_EXTENSIONS.has(ext)) {
    ext = 'bin';
  }

  // Sanitiza caracteres especiais da base
  baseName = baseName.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/^_+|_+$/g, '').slice(0, 50);
  if (!baseName || WINDOWS_RESERVED_NAMES.has(baseName.toUpperCase())) {
    baseName = `file-${Date.now()}`;
  }

  return ext ? `${baseName}.${ext}` : baseName;
}
