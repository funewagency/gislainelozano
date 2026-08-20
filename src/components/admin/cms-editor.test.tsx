// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const mockSave = vi.fn();

vi.mock('@/lib/cms-store', () => ({
  useCmsEditor: (selector: (s: any) => any) => {
    const state = {
      data: {
        meta: { lastSaved: null, lastSavedBy: null, version: 1 },
        sectionOrder: [
          { id: 'hero', label: 'Hero', enabled: true },
          { id: 'whatsappModal', label: 'WhatsApp Modal', enabled: true },
        ],
        theme: {
          primaryColor: '#19396C', accentColor: '#DF823C', backgroundColor: '#FAF6EF',
          surfaceColor: '#FFFFFF', textColor: '#1A1A1A', mutedColor: '#6B7280',
          headingFont: 'Outfit', bodyFont: 'Inter', baseFontSize: 16,
          sectionPadding: 80, cardBorderRadius: 8, buttonBorderRadius: 4,
          headingLetterSpacing: -1, bodyLineHeight: 1.6,
        },
        navbar: { logoUrl: '/logo.png', brandName: 'Gislaine', whatsappUrl: 'https://wa.me/1', links: [] },
        hero: { titleHtml: '<h1>Hero</h1>', description: 'Desc', ctaText: 'CTA', scrollLabel: 'Scroll', mobileImageUrl: '/m.jpg', desktopImageUrl: '/d.jpg' },
        painPoints: { eyebrow: 'Para quem', bullets: ['Item'], calloutText: 'Call', calloutEmphasis: 'Emp' },
        bio: { eyebrow: 'Bio', titleHtml: '<h2>Bio</h2>', paragraphs: ['P1'], portraitImageUrl: '/p.jpg', careerPath: ['C1'], overlayName: 'G', overlayRole: 'M' },
        positioning: { eyebrow: 'Pos', titleHtml: '<h2>Pos</h2>', paragraph1: 'P1', emphasisText: 'Emp', paragraph2: 'P2' },
        services: { eyebrow: 'Serv', titleHtml: '<h2>Serv</h2>', items: [] },
        testimonials: { eyebrow: 'Test', titleHtml: '<h2>Test</h2>', description: 'Desc', items: [] },
        faq: { eyebrow: 'FAQ', titleHtml: '<h2>FAQ</h2>', items: [], footerCtaQuestion: '', footerCtaButtonText: '' },
        contact: { eyebrow: 'Cont', titleHtml: '<h2>Cont</h2>', description: 'Desc', features: [], guaranteeTitle: '', guaranteeDescription: '', submitButtonText: '' },
        footer: { brandName: 'Gislaine', logoUrl: '/logo.png', copyrightText: '©2024', links: [] },
        whatsappModal: { title: 'Fale', message: 'Olá', buttonText: 'Abrir', phoneNumber: '5511999999999', triggerDelay: 5000, showOnExitIntent: true },
      },
      isDirty: false,
      isSaving: false,
      save: mockSave,
      toggleSectionEnabled: vi.fn(),
      reorderSections: vi.fn(),
      selectedSection: null,
      selectSection: vi.fn(),
      updateField: vi.fn(),
      updateSection: vi.fn(),
      updateTheme: vi.fn(),
      revisions: [],
      lastSavedVersion: 1,
      setServerData: vi.fn(),
      revertToRevision: vi.fn(),
      publish: vi.fn(),
    };
    return selector(state);
  },
}));

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { name: 'Admin' } } }),
}));

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: any) => children,
  closestCenter: () => {},
  PointerSensor: class { static activators = [] },
  useSensor: () => ({}),
  useSensors: (...sensors: any[]) => sensors,
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: any) => children,
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: null,
    isDragging: false,
  }),
  verticalListSortingStrategy: {},
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } },
}));

import { CmsEditor } from './cms-editor';

describe('CmsEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the editor title', () => {
    render(<CmsEditor />);
    expect(screen.getByText('Editor de Conteúdo')).toBeDefined();
  });

  it('shows save button disabled when not dirty', () => {
    render(<CmsEditor />);
    const saveBtn = screen.getByRole('button', { name: /Salvar/i });
    expect(saveBtn).toBeDisabled();
  });

  it('shows section tabs', () => {
    render(<CmsEditor />);
    expect(screen.getByRole('tab', { name: /Conteúdo/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /Histórico/i })).toBeDefined();
  });
});
