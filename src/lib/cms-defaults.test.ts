import { describe, it, expect } from 'vitest';
import { DEFAULT_CMS_DATA, DEFAULT_THEME } from './cms-defaults';
import { globalConfigSchema, themeConfigSchema } from './cms-types';

describe('DEFAULT_CMS_DATA', () => {
  it('conforms to globalConfigSchema', () => {
    const result = globalConfigSchema.safeParse(DEFAULT_CMS_DATA);
    if (!result.success) {
      console.error('Validation errors:', JSON.stringify(result.error.issues, null, 2));
    }
    expect(result.success).toBe(true);
  });

  it('has all required sections', () => {
    const sections = [
      'navbar', 'hero', 'painPoints', 'bio', 'positioning',
      'services', 'testimonials', 'faq', 'contact', 'footer', 'whatsappModal',
    ];
    for (const section of sections) {
      expect(DEFAULT_CMS_DATA).toHaveProperty(section);
    }
  });

  it('has a non-empty sectionOrder', () => {
    expect(DEFAULT_CMS_DATA.sectionOrder.length).toBeGreaterThan(0);
  });

  it('has valid meta', () => {
    expect(DEFAULT_CMS_DATA.meta.version).toBeGreaterThanOrEqual(1);
  });

  it('navbar has required fields', () => {
    const nav = DEFAULT_CMS_DATA.navbar;
    expect(nav.brandName).toBeTruthy();
    expect(nav.logoUrl).toBeTruthy();
    expect(nav.whatsappUrl).toBeTruthy();
    expect(nav.links.length).toBeGreaterThan(0);
  });

  it('hero has required fields', () => {
    const hero = DEFAULT_CMS_DATA.hero;
    expect(hero.titleHtml).toBeTruthy();
    expect(hero.description).toBeTruthy();
    expect(hero.ctaText).toBeTruthy();
    expect(hero.mobileImageUrl).toBeTruthy();
    expect(hero.desktopImageUrl).toBeTruthy();
  });

  it('services has at least one item', () => {
    expect(DEFAULT_CMS_DATA.services.items.length).toBeGreaterThan(0);
  });

  it('testimonials has at least one item', () => {
    expect(DEFAULT_CMS_DATA.testimonials.items.length).toBeGreaterThan(0);
  });

  it('faq has at least one item', () => {
    expect(DEFAULT_CMS_DATA.faq.items.length).toBeGreaterThan(0);
  });

  it('whatsappModal has default values', () => {
    const wm = DEFAULT_CMS_DATA.whatsappModal;
    expect(wm.title).toBeTruthy();
    expect(wm.message).toBeTruthy();
    expect(wm.buttonText).toBeTruthy();
    expect(wm.phoneNumber).toBeTruthy();
    expect(typeof wm.triggerDelay).toBe('number');
    expect(typeof wm.showOnExitIntent).toBe('boolean');
  });
});

describe('DEFAULT_THEME', () => {
  it('conforms to themeConfigSchema', () => {
    const result = themeConfigSchema.safeParse(DEFAULT_THEME);
    expect(result.success).toBe(true);
  });

  it('has all color fields', () => {
    expect(DEFAULT_THEME.primaryColor).toMatch(/^#/);
    expect(DEFAULT_THEME.accentColor).toMatch(/^#/);
    expect(DEFAULT_THEME.backgroundColor).toMatch(/^#/);
    expect(DEFAULT_THEME.surfaceColor).toMatch(/^#/);
    expect(DEFAULT_THEME.textColor).toMatch(/^#/);
    expect(DEFAULT_THEME.mutedColor).toMatch(/^#/);
  });

  it('has font fields', () => {
    expect(DEFAULT_THEME.headingFont).toBeTruthy();
    expect(DEFAULT_THEME.bodyFont).toBeTruthy();
  });

  it('has numeric fields within range', () => {
    expect(DEFAULT_THEME.baseFontSize).toBeGreaterThanOrEqual(14);
    expect(DEFAULT_THEME.baseFontSize).toBeLessThanOrEqual(24);
    expect(DEFAULT_THEME.sectionPadding).toBeGreaterThanOrEqual(16);
    expect(DEFAULT_THEME.cardBorderRadius).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_THEME.buttonBorderRadius).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_THEME.bodyLineHeight).toBeGreaterThanOrEqual(1.2);
  });
});
