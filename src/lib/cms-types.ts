import { z } from 'zod/v4';

// ── Field-level validators ──────────────────────────────────────────

const shortText = z.string().min(1, 'Required').max(200, 'Max 200 characters');
const longText = z.string().min(1, 'Required').max(5000, 'Max 5000 characters');
const paraText = z.string().min(1, 'Required').max(600, 'Max 600 characters');
const imageUrl = z.string().min(1, 'Required').max(500, 'Invalid path');
const url = z.string().url('Must be a valid URL').or(z.string().startsWith('/'));
const hexColor = z.string().regex(/^#[0-9a-fA-F]{3,8}$/, 'Invalid hex color').or(z.string().length(0));

// ── Navbar ──────────────────────────────────────────────────────────

const navLinkSchema = z.object({
  id: z.string(),
  label: shortText,
  sectionId: z.string(),
});

export const navbarConfigSchema = z.object({
  logoUrl: imageUrl,
  brandName: shortText,
  whatsappUrl: url,
  links: z.array(navLinkSchema).min(1).max(10),
});

// ── Hero ────────────────────────────────────────────────────────────

export const heroConfigSchema = z.object({
  titleHtml: longText,
  description: longText,
  ctaText: shortText,
  scrollLabel: shortText,
  mobileImageUrl: imageUrl,
  desktopImageUrl: imageUrl,
});

// ── Pain Points ─────────────────────────────────────────────────────

export const painPointsConfigSchema = z.object({
  eyebrow: shortText,
  bullets: z.array(paraText).min(1).max(8),
  calloutText: longText,
  calloutEmphasis: longText,
});

// ── Bio ─────────────────────────────────────────────────────────────

export const bioConfigSchema = z.object({
  eyebrow: shortText,
  titleHtml: longText,
  paragraphs: z.array(paraText).min(1).max(6),
  portraitImageUrl: imageUrl,
  careerPath: z.array(shortText).min(1).max(10),
  overlayName: shortText,
  overlayRole: shortText,
});

// ── Positioning ─────────────────────────────────────────────────────

export const positioningConfigSchema = z.object({
  eyebrow: shortText,
  titleHtml: longText,
  paragraph1: longText,
  emphasisText: longText,
  paragraph2: longText,
});

// ── Services ────────────────────────────────────────────────────────

const serviceItemSchema = z.object({
  id: z.string(),
  number: z.string(),
  title: shortText,
  subtitle: z.string().max(200).nullable(),
  description: longText,
  ctaText: shortText,
  includes: z.array(shortText).nullable(),
});

export const servicesConfigSchema = z.object({
  eyebrow: shortText,
  titleHtml: longText,
  items: z.array(serviceItemSchema).min(1).max(20),
});

// ── Testimonials ────────────────────────────────────────────────────

const testimonialParagraphSchema = z.object({
  id: z.string(),
  text: longText,
});

const testimonialItemSchema = z.object({
  id: z.string(),
  name: shortText,
  role: z.string().max(200).nullable(),
  paragraphs: z.array(testimonialParagraphSchema).min(1).max(10),
});

export const testimonialsConfigSchema = z.object({
  eyebrow: shortText,
  titleHtml: longText,
  description: longText,
  items: z.array(testimonialItemSchema).min(1).max(50),
});

// ── FAQ ─────────────────────────────────────────────────────────────

const faqItemSchema = z.object({
  id: z.string(),
  question: z.string().min(1, 'Required').max(300, 'Max 300 characters'),
  answer: longText,
});

export const faqConfigSchema = z.object({
  eyebrow: shortText,
  titleHtml: longText,
  items: z.array(faqItemSchema).min(1).max(50),
  footerCtaQuestion: longText,
  footerCtaButtonText: shortText,
});

// ── Contact ─────────────────────────────────────────────────────────

export const contactConfigSchema = z.object({
  eyebrow: shortText,
  titleHtml: longText,
  description: longText,
  features: z.array(shortText).min(1).max(10),
  guaranteeTitle: shortText,
  guaranteeDescription: shortText,
  submitButtonText: shortText,
});

// ── Footer ──────────────────────────────────────────────────────────

export const footerConfigSchema = z.object({
  brandName: shortText,
  logoUrl: imageUrl,
  copyrightText: shortText,
  links: z.array(navLinkSchema).min(1).max(10),
});

// ── Theme ───────────────────────────────────────────────────────────

export const themeConfigSchema = z.object({
  primaryColor: hexColor,
  accentColor: hexColor,
  backgroundColor: hexColor,
  surfaceColor: hexColor,
  textColor: hexColor,
  mutedColor: hexColor,
  headingFont: z.string(),
  bodyFont: z.string(),
  baseFontSize: z.number().min(12).max(24),
  sectionPadding: z.number().min(16).max(160),
  cardBorderRadius: z.number().min(0).max(32),
  buttonBorderRadius: z.number().min(0).max(32),
  headingLetterSpacing: z.number().min(-2).max(8),
  bodyLineHeight: z.number().min(1.2).max(2.4),
});

// ── WhatsApp Modal ───────────────────────────────────────────────────

export const whatsappModalConfigSchema = z.object({
  title: shortText,
  message: longText,
  buttonText: shortText,
  phoneNumber: shortText,
  triggerDelay: z.number().int().min(0).max(60000), // in ms
  showOnExitIntent: z.boolean(),
});

// ── Global Config ───────────────────────────────────────────────────

const sectionOrderItemSchema = z.object({
  id: z.string(),
  label: shortText,
  enabled: z.boolean(),
});

const metaConfigSchema = z.object({
  lastSaved: z.string().nullable(),
  lastSavedBy: z.string().nullable(),
  version: z.number().int().min(1),
});

export const globalConfigSchema = z.object({
  meta: metaConfigSchema,
  sectionOrder: z.array(sectionOrderItemSchema).min(1).max(20),
  theme: themeConfigSchema,
  navbar: navbarConfigSchema,
  hero: heroConfigSchema,
  painPoints: painPointsConfigSchema,
  bio: bioConfigSchema,
  positioning: positioningConfigSchema,
  services: servicesConfigSchema,
  testimonials: testimonialsConfigSchema,
  faq: faqConfigSchema,
  contact: contactConfigSchema,
  footer: footerConfigSchema,
  whatsappModal: whatsappModalConfigSchema,
});

// ── Derived Types ───────────────────────────────────────────────────

export type GlobalConfig = z.infer<typeof globalConfigSchema>;
export type NavbarConfig = z.infer<typeof navbarConfigSchema>;
export type HeroConfig = z.infer<typeof heroConfigSchema>;
export type PainPointsConfig = z.infer<typeof painPointsConfigSchema>;
export type BioConfig = z.infer<typeof bioConfigSchema>;
export type PositioningConfig = z.infer<typeof positioningConfigSchema>;
export type ServicesConfig = z.infer<typeof servicesConfigSchema>;
export type TestimonialsConfig = z.infer<typeof testimonialsConfigSchema>;
export type FaqConfig = z.infer<typeof faqConfigSchema>;
export type ContactConfig = z.infer<typeof contactConfigSchema>;
export type FooterConfig = z.infer<typeof footerConfigSchema>;
export type ThemeConfig = z.infer<typeof themeConfigSchema>;
export type NavLink = z.infer<typeof navLinkSchema>;
export type ServiceItem = z.infer<typeof serviceItemSchema>;
export type TestimonialItem = z.infer<typeof testimonialItemSchema>;
export type FaqItem = z.infer<typeof faqItemSchema>;
export type SectionOrderItem = z.infer<typeof sectionOrderItemSchema>;

export type SectionKey = keyof Omit<GlobalConfig, 'meta' | 'sectionOrder' | 'theme'>;
