// Shared constants for Gislaine Lozano landing page

export const C = {
  primary: '#19396C',
  primaryLight: '#1E4680',
  accent: '#DF823C',
  accentLight: '#EF9648',
  accentDark: '#C46A25',
  cta: '#B35C1A',
  base: '#FAF6EF',
  baseDark: '#F0EAE0',
  text: '#1A1C20',
  white: '#FFFFFF',
  muted: '#4A4D51',

  border: '#E5E7EB',
  surface: '#F9FAFB',
  surfaceAlt: '#F3F4F6',
  placeholder: '#6B7280',
  hover: '#F3F4F6',
  success: '#059669',
  error: '#DC2626',
  whatsapp: '#25D366',
  warning: '#FEF3C7',
  warningText: '#92400E',
  inactive: '#D1D5DB',
} as const;

export const headingFont = { fontFamily: 'var(--font-outfit), sans-serif' };
export const headingFontBold = { fontFamily: 'var(--font-syne), sans-serif' };
export const bodyFont = { fontFamily: 'var(--font-jakarta), sans-serif' };
export const bodyFontAlt = { fontFamily: 'var(--font-inter), sans-serif' };

export const NAV_HEIGHT = 72;

/** WhatsApp deep link — all CTA buttons point here */
export const WHATSAPP_URL =
  'https://wa.me/5545988231902?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20a%20mentoria.';
