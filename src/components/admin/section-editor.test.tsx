// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const mockUpdateField = vi.fn();
const mockSelectSection = vi.fn();

vi.mock('@/lib/cms-store', () => ({
  useCmsEditor: Object.assign(
    (selector: any) => {
      const state = {
        data: {
          navbar: { logoUrl: '/logo.png', brandName: 'Gislaine', whatsappUrl: 'https://wa.me/1', links: [] },
          hero: { titleHtml: '<h1>Hero</h1>', description: 'Desc', ctaText: 'CTA', scrollLabel: 'Scroll', mobileImageUrl: '/m.jpg', desktopImageUrl: '/d.jpg' },
          painPoints: { eyebrow: 'Para quem', bullets: ['Item'], calloutText: 'Call', calloutEmphasis: 'Emp' },
          whatsappModal: { title: 'Fale conosco', message: 'Olá!', buttonText: 'Abrir WhatsApp', phoneNumber: '5511999999999', triggerDelay: 5000, showOnExitIntent: true },
        },
        selectedSection: 'whatsappModal',
      };
      return selector(state);
    },
    { getState: () => ({}) },
  ),
}));

import { SectionEditor, ThemeEditor } from './section-editor';

describe('SectionEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders section label', () => {
    render(<SectionEditor sectionKey="whatsappModal" label="WhatsApp Modal" />);
    expect(screen.getByText('WhatsApp Modal')).toBeDefined();
  });

  it('shows fields when selected', () => {
    render(<SectionEditor sectionKey="whatsappModal" label="WhatsApp Modal" />);
    expect(screen.getByLabelText('Título do Modal')).toBeDefined();
  });
});
