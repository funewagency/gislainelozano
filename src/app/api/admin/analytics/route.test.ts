import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSession = vi.fn();
vi.mock('next-auth', () => ({
  getServerSession: () => mockSession(),
}));

vi.mock('@/lib/posthog-api', () => ({
  getPostHogAnalytics: vi.fn().mockResolvedValue({
    pageViews: { total: 100, trend: [{ date: '2024-01-01', count: 10 }] },
    uniqueVisitors: 50,
    topSources: [{ source: 'google', count: 30 }],
    topPages: [{ path: '/', views: 80 }],
    recentEvents: [{ event: 'pageview', count: 100 }],
    conversionFunnel: [{ step: 'Pageview', count: 100 }],
  }),
  isPostHogConfigured: vi.fn().mockReturnValue(true),
}));

vi.mock('@/lib/rate-limit', () => ({
  readLimiter: { check: vi.fn().mockReturnValue({ allowed: true }) },
  shouldRateLimit: vi.fn().mockReturnValue(false),
}));

import { GET } from './route';

describe('GET /api/admin/analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockSession.mockResolvedValue(null);
    const req = new Request('http://localhost:3000/api/admin/analytics');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns analytics data when configured', async () => {
    mockSession.mockResolvedValue({ user: { name: 'Admin' } });
    const req = new Request('http://localhost:3000/api/admin/analytics');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.configured).toBe(true);
    expect(body.pageViews.total).toBe(100);
    expect(body.uniqueVisitors).toBe(50);
  });
});
