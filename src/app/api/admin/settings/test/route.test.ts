import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockSession = vi.fn();
vi.mock('next-auth', () => ({
  getServerSession: () => mockSession(),
}));

vi.mock('@/lib/rate-limit', () => ({
  mutationLimiter: { check: vi.fn().mockReturnValue({ allowed: true }) },
  shouldRateLimit: vi.fn().mockReturnValue(false),
}));

import { POST } from './route';

function makeRequest(service: string, id: string) {
  return new NextRequest('http://localhost:3000/api/admin/settings/test', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ service, id }),
  });
}

describe('POST /api/admin/settings/test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession.mockResolvedValue({ user: { name: 'Admin' } });
  });

  it('returns 401 when not authenticated', async () => {
    mockSession.mockResolvedValue(null);
    const res = await POST(makeRequest('ga4', 'G-TEST'));
    expect(res.status).toBe(401);
  });

  it('validates a correct GA4 ID', async () => {
    const res = await POST(makeRequest('ga4', 'G-MEASUREMENT123'));
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it('rejects an invalid GA4 ID', async () => {
    const res = await POST(makeRequest('ga4', 'invalid'));
    const body = await res.json();
    expect(body.ok).toBe(false);
  });

  it('validates a correct Facebook Pixel ID', async () => {
    const res = await POST(makeRequest('facebook', '1234567890123'));
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it('rejects an invalid Facebook Pixel ID', async () => {
    const res = await POST(makeRequest('facebook', 'abc'));
    const body = await res.json();
    expect(body.ok).toBe(false);
  });

  it('validates a correct Google Ads ID', async () => {
    const res = await POST(makeRequest('google-ads', 'AW-1234567890'));
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it('rejects an invalid Google Ads ID', async () => {
    const res = await POST(makeRequest('google-ads', 'invalid'));
    const body = await res.json();
    expect(body.ok).toBe(false);
  });

  it('returns error for unknown service', async () => {
    const res = await POST(makeRequest('unknown-service', 'test'));
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.error).toBe('Serviço inválido');
  });

  it('returns error for empty ID', async () => {
    const res = await POST(makeRequest('ga4', ''));
    const body = await res.json();
    expect(body.ok).toBe(false);
  });

  it('returns error for ID longer than 100 chars', async () => {
    const res = await POST(makeRequest('ga4', 'G-' + 'a'.repeat(100)));
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.error).toBe('ID muito longo');
  });
});
