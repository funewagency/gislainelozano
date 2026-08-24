import { describe, it, expect } from 'vitest';
import { formatBrazilianPhone } from './phone';

describe('formatBrazilianPhone', () => {
  it('returns empty string for empty input', () => {
    expect(formatBrazilianPhone('')).toBe('');
    expect(formatBrazilianPhone('   ')).toBe('');
  });

  it('formats partial input progressively', () => {
    expect(formatBrazilianPhone('1')).toBe('(1');
    expect(formatBrazilianPhone('11')).toBe('(11');
    expect(formatBrazilianPhone('119')).toBe('(11) 9');
    expect(formatBrazilianPhone('119876')).toBe('(11) 9876');
  });

  it('formats 10-digit landline numbers correctly', () => {
    expect(formatBrazilianPhone('1134567890')).toBe('(11) 3456-7890');
    expect(formatBrazilianPhone('(11) 3456-7890')).toBe('(11) 3456-7890');
  });

  it('formats 11-digit mobile numbers correctly', () => {
    expect(formatBrazilianPhone('11987654321')).toBe('(11) 98765-4321');
    expect(formatBrazilianPhone('(11) 98765-4321')).toBe('(11) 98765-4321');
  });

  it('strips international +55 country code if pasted', () => {
    expect(formatBrazilianPhone('+55 11 98765-4321')).toBe('(11) 98765-4321');
    expect(formatBrazilianPhone('5511987654321')).toBe('(11) 98765-4321');
    expect(formatBrazilianPhone('551134567890')).toBe('(11) 3456-7890');
  });

  it('removes non-numeric characters', () => {
    expect(formatBrazilianPhone('abc')).toBe('');
    expect(formatBrazilianPhone('11-9.8765--4321')).toBe('(11) 98765-4321');
  });
});
