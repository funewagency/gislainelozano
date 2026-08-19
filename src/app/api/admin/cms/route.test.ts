import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockSession = vi.hoisted(() => vi.fn());
vi.mock('next-auth', () => ({
  getServerSession: () => mockSession(),
}));

const mockDb = vi.hoisted(() => ({
  cmsState: {
    findUnique: vi.fn(),
    create: vi.fn(),
    upsert: vi.fn(),
  },
  cmsRevision: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
}));
vi.mock('@/lib/db', () => ({ db: mockDb }));

vi.mock('@/lib/rate-limit', () => ({
  mutationLimiter: { check: vi.fn().mockReturnValue({ allowed: true }) },
  shouldRateLimit: vi.fn().mockReturnValue(false),
}));

import { GET, PUT } from './route';

const DEFAULT_CMS = {
  meta: { lastSaved: null, lastSavedBy: null, version: 1 },
  sectionOrder: [{ id: 'hero', label: 'Hero', enabled: true }],
  theme: {
    primaryColor: '#19396C', accentColor: '#DF823C', backgroundColor: '#FAF6EF',
    surfaceColor: '#FFFFFF', textColor: '#1A1A1A', mutedColor: '#6B7280',
    headingFont: 'Outfit', bodyFont: 'Inter', baseFontSize: 16,
    sectionPadding: 80, cardBorderRadius: 8, buttonBorderRadius: 4,
    headingLetterSpacing: -1, bodyLineHeight: 1.6,
  },
  navbar: { logoUrl: '/logo.png', brandName: 'Gislaine', whatsappUrl: 'https://wa.me/1', links: [{ id: '1', label: 'Sobre', sectionId: 'sobre' }] },
  hero: { titleHtml: '<h1>Hero</h1>', description: 'Desc', ctaText: 'CTA', scrollLabel: 'Scroll', mobileImageUrl: '/m.jpg', desktopImageUrl: '/d.jpg' },
  painPoints: { eyebrow: 'Para quem', bullets: ['Item'], calloutText: 'Call', calloutEmphasis: 'Emp' },
  bio: { eyebrow: 'Bio', titleHtml: '<h2>Bio</h2>', paragraphs: ['P1'], portraitImageUrl: '/p.jpg', careerPath: ['C1'], overlayName: 'G', overlayRole: 'M' },
  positioning: { eyebrow: 'Pos', titleHtml: '<h2>Pos</h2>', paragraph1: 'P1', emphasisText: 'Emp', paragraph2: 'P2' },
  services: { eyebrow: 'Serv', titleHtml: '<h2>Serv</h2>', items: [{ id: '1', number: '01', title: 'Serv', subtitle: null, description: 'Desc', ctaText: 'Click', includes: null }] },
  testimonials: { eyebrow: 'Test', titleHtml: '<h2>Test</h2>', description: 'Desc', items: [{ id: '1', name: 'Maria', role: null, paragraphs: [{ id: 'p1', text: 'Great' }] }] },
  faq: { eyebrow: 'FAQ', titleHtml: '<h2>FAQ</h2>', items: [{ id: '1', question: 'Q?', answer: 'A' }], footerCtaQuestion: 'More?', footerCtaButtonText: 'Contact' },
  contact: { eyebrow: 'Cont', titleHtml: '<h2>Cont</h2>', description: 'Desc', features: ['Fast'], guaranteeTitle: 'G', guaranteeDescription: 'D', submitButtonText: 'Send' },
  footer: { brandName: 'Gislaine', logoUrl: '/logo.png', copyrightText: '©2024', links: [{ id: '1', label: 'Home', sectionId: 'home' }] },
  whatsappModal: { title: 'Fale', message: 'Olá', buttonText: 'Abrir', phoneNumber: '5511999999999', triggerDelay: 5000, showOnExitIntent: true },
};

describe('GET /api/admin/cms', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.cmsState.findUnique.mockReset();
    mockDb.cmsState.create.mockReset();
    mockDb.cmsRevision.findMany.mockReset();
  });

  it('returns existing CMS data', async () => {
    mockDb.cmsState.findUnique.mockResolvedValue({
      tenant: 'gislaine',
      data: JSON.stringify(DEFAULT_CMS),
      version: 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Admin',
    });
    mockDb.cmsRevision.findMany.mockResolvedValue([]);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toBeDefined();
    expect(body.data.hero.titleHtml).toBe('<h1>Hero</h1>');
    expect(body.meta.version).toBe(1);
  });

  it('creates default data when no state exists', async () => {
    mockDb.cmsState.findUnique.mockResolvedValue(null);
    mockDb.cmsState.create.mockResolvedValue({
      tenant: 'gislaine',
      data: JSON.stringify(DEFAULT_CMS),
      version: 1,
      updatedAt: new Date().toISOString(),
      updatedBy: null,
    });
    mockDb.cmsRevision.findMany.mockResolvedValue([]);

    const res = await GET();
    expect(res.status).toBe(200);
    expect(mockDb.cmsState.create).toHaveBeenCalled();
  });

  it('handles database error gracefully', async () => {
    mockDb.cmsState.findUnique.mockRejectedValue(new Error('DB error'));
    const res = await GET();
    expect(res.status).toBe(500);
  });
});

describe('PUT /api/admin/cms', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession.mockReset();
    mockDb.cmsState.upsert.mockReset();
    mockDb.cmsRevision.create.mockReset();
  });

  it('returns 401 when not authenticated', async () => {
    mockSession.mockResolvedValue(null);
    const req = new NextRequest('http://localhost:3000/api/admin/cms', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(DEFAULT_CMS),
    });
    const res = await PUT(req);
    expect(res.status).toBe(401);
  });

  it('saves valid CMS data when authenticated', async () => {
    mockSession.mockResolvedValue({ user: { name: 'Admin', email: 'admin@test.com' } });
    mockDb.cmsState.upsert.mockResolvedValue({ version: 2 });
    mockDb.cmsRevision.create.mockResolvedValue({
      version: 2, summary: 'Atualização v2', createdAt: new Date().toISOString(), createdBy: 'Admin',
    });

    const payload = { ...DEFAULT_CMS, meta: { ...DEFAULT_CMS.meta, version: 2 } };
    const req = new NextRequest('http://localhost:3000/api/admin/cms', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const res = await PUT(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.version).toBe(2);
  });

  it('returns 422 for invalid data', async () => {
    mockSession.mockResolvedValue({ user: { name: 'Admin' } });
    const req = new NextRequest('http://localhost:3000/api/admin/cms', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ meta: {}, sectionOrder: [], theme: {}, navbar: {} }),
    });
    const res = await PUT(req);
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.code).toBe('VALIDATION_ERROR');
  });
});
