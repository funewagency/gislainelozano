import { describe, it, expect } from 'vitest';
import { escapeHtml, sanitizeInput, sanitizeEmail, sanitizePhone, isValidId } from './sanitize';
import { validateImageMagicBytes, sanitizeSafeFilename } from './file-security';

describe('Sanitize & Security Module', () => {
  describe('escapeHtml', () => {
    it('escapes special html chars', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
      expect(escapeHtml("Tom & 'Jerry'")).toBe('Tom &amp; &#039;Jerry&#039;');
    });
  });

  describe('sanitizeInput', () => {
    it('removes script, iframe tags and event handlers', () => {
      expect(sanitizeInput('<script>alert(1)</script>Hello')).toBe('Hello');
      expect(sanitizeInput('<img src="x" onerror="alert(1)">')).toBe('<img src="x" >');
      expect(sanitizeInput('javascript:alert(1)')).toBe('javascript_:alert(1)');
    });

    it('enforces maximum length', () => {
      const longStr = 'a'.repeat(3000);
      expect(sanitizeInput(longStr, 100).length).toBe(100);
    });
  });

  describe('sanitizeEmail & sanitizePhone', () => {
    it('normalizes email', () => {
      expect(sanitizeEmail('  USER@EXAMPLE.COM ')).toBe('user@example.com');
    });

    it('cleans phone to digits only', () => {
      expect(sanitizePhone('(11) 98765-4321')).toBe('11987654321');
    });
  });

  describe('isValidId', () => {
    it('accepts valid alphanumeric IDs, UUIDs and CUIDs', () => {
      expect(isValidId('cm1234567890abcdef')).toBe(true);
      expect(isValidId('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(isValidId('user_123-abc')).toBe(true);
    });

    it('rejects path traversal, spaces and special characters', () => {
      expect(isValidId('../../etc/passwd')).toBe(false);
      expect(isValidId("1' OR '1'='1")).toBe(false);
      expect(isValidId('<script>')).toBe(false);
      expect(isValidId('')).toBe(false);
    });
  });

  describe('File Security & Magic Bytes', () => {
    it('validates JPEG magic bytes', () => {
      const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
      expect(validateImageMagicBytes(jpegBuffer, 'image/jpeg')).toBe(true);
      expect(validateImageMagicBytes(jpegBuffer, 'image/png')).toBe(false);
    });

    it('validates PNG magic bytes', () => {
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
      expect(validateImageMagicBytes(pngBuffer, 'image/png')).toBe(true);
      expect(validateImageMagicBytes(pngBuffer, 'image/jpeg')).toBe(false);
    });

    it('rejects fake images (e.g. PHP/script pretending to be JPG)', () => {
      const fakeBuffer = Buffer.from('<?php echo "evil"; ?>');
      expect(validateImageMagicBytes(fakeBuffer, 'image/jpeg')).toBe(false);
    });

    it('sanitizes filename and prevents directory traversal', () => {
      expect(sanitizeSafeFilename('../../../evil.php')).toBe('evil.bin');
      expect(sanitizeSafeFilename('photo.png')).toBe('photo.png');
      expect(sanitizeSafeFilename('CON.png')).not.toBe('CON.png');
    });
  });
});
