import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockSession = vi.hoisted(() => vi.fn());
vi.mock('next-auth', () => ({
  getServerSession: () => mockSession(),
}));

const mockDb = vi.hoisted(() => ({
  analyticsSetting: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
}));
vi.mock('@/lib/db', () => ({ db: mockDb }));

vi.mock('@/lib/rate-limit', () => ({
  mutationLimiter: { check: vi.fn().mockReturnValue({ allowed: true }) },
  readLimiter: { check: vi.fn().mockReturnValue({ allowed: true }) },
  shouldRateLimit: vi.fn().mockReturnValue(false),
}));

import { GET, PUT } from './route';

describe('GET /api/admin/settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession.mockResolvedValue({ user: { name: 'Admin' } });
  });

  it('returns 401 when not authenticated', async () => {
    mockSession.mockResolvedValue(null);
    const req = new NextRequest('http://localhost:3000/api/admin/settings');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns settings with configured flags', async () => {
    mockDb.analyticsSetting.findUnique.mockResolvedValue({
      id: 'default',
      ga4Id: 'G-MEASUREMENT',
      fbPixelId: '1234567890',
      gAdsId: null,
      gAdsLabel: null,
    });

    const req = new NextRequest('http://localhost:3000/api/admin/settings');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ga4Id).toBe('G-MEASUREMENT');
    expect(body.fbPixelId).toBe('1234567890');
    expect(body.configured.ga4).toBe(true);
    expect(body.configured.fb).toBe(true);
    expect(body.configured.gAds).toBe(false);
  });

  it('returns empty strings when no settings exist', async () => {
    mockDb.analyticsSetting.findUnique.mockResolvedValue(null);
    const req = new NextRequest('http://localhost:3000/api/admin/settings');
    const res = await GET(req);
    const body = await res.json();
    expect(body.ga4Id).toBe('');
    expect(body.fbPixelId).toBe('');
  });
});

describe('PUT /api/admin/settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession.mockResolvedValue({ user: { name: 'Admin' } });
  });

  it('returns 401 when not authenticated', async () => {
    mockSession.mockResolvedValue(null);
    const req = new NextRequest('http://localhost:3000/api/admin/settings', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ga4Id: 'G-TEST' }),
    });
    const res = await PUT(req);
    expect(res.status).toBe(401);
  });

  it('saves valid settings', async () => {
    mockDb.analyticsSetting.upsert.mockResolvedValue({
      id: 'default',
      ga4Id: 'G-TEST',
      fbPixelId: '',
      gAdsId: '',
      gAdsLabel: '',
    });

    const req = new NextRequest('http://localhost:3000/api/admin/settings', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ga4Id: 'G-TEST', fbPixelId: '', gAdsId: '', gAdsLabel: '' }),
    });
    const res = await PUT(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ga4Id).toBe('G-TEST');
  });

  it('returns 400 for invalid field types', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/settings', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ga4Id: 123 }),
    });
    const res = await PUT(req);
    expect(res.status).toBe(400);
  });
});
