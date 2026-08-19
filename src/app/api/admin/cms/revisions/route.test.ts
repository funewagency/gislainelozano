import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockSession = vi.hoisted(() => vi.fn());
vi.mock('next-auth', () => ({
  getServerSession: () => mockSession(),
}));

const mockDb = vi.hoisted(() => ({
  cmsRevision: {
    findMany: vi.fn(),
    count: vi.fn(),
    findFirst: vi.fn(),
  },
}));
vi.mock('@/lib/db', () => ({ db: mockDb }));

vi.mock('@/lib/rate-limit', () => ({
  mutationLimiter: { check: vi.fn().mockReturnValue({ allowed: true }) },
  shouldRateLimit: vi.fn().mockReturnValue(false),
}));

import { GET, POST } from './route';

describe('GET /api/admin/cms/revisions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession.mockResolvedValue({ user: { name: 'Admin' } });
  });

  it('returns 401 when not authenticated', async () => {
    mockSession.mockResolvedValue(null);
    const req = new NextRequest('http://localhost:3000/api/admin/cms/revisions');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns paginated revisions', async () => {
    mockDb.cmsRevision.findMany.mockResolvedValue([
      { id: '1', version: 2, summary: 'v2', createdAt: new Date().toISOString(), createdBy: 'Admin' },
      { id: '2', version: 1, summary: 'v1', createdAt: new Date().toISOString(), createdBy: 'Admin' },
    ]);
    mockDb.cmsRevision.count.mockResolvedValue(2);

    const req = new NextRequest('http://localhost:3000/api/admin/cms/revisions?limit=10&offset=0');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.revisions).toHaveLength(2);
    expect(body.total).toBe(2);
  });

  it('enforces max limit of 200', async () => {
    mockDb.cmsRevision.findMany.mockResolvedValue([]);
    mockDb.cmsRevision.count.mockResolvedValue(0);

    const req = new NextRequest('http://localhost:3000/api/admin/cms/revisions?limit=500');
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(mockDb.cmsRevision.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 200 }),
    );
  });
});

describe('POST /api/admin/cms/revisions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession.mockResolvedValue({ user: { name: 'Admin' } });
  });

  it('returns 401 when not authenticated', async () => {
    mockSession.mockResolvedValue(null);
    const req = new NextRequest('http://localhost:3000/api/admin/cms/revisions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ version: 1 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns revision data for a given version', async () => {
    mockDb.cmsRevision.findFirst.mockResolvedValue({
      version: 1,
      summary: 'v1',
      createdAt: new Date().toISOString(),
      createdBy: 'Admin',
      data: JSON.stringify({ test: 'data' }),
    });

    const req = new NextRequest('http://localhost:3000/api/admin/cms/revisions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ version: 1 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.version).toBe(1);
    expect(body.data.test).toBe('data');
  });

  it('returns 400 when version is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/cms/revisions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 404 when revision not found', async () => {
    mockDb.cmsRevision.findFirst.mockResolvedValue(null);
    const req = new NextRequest('http://localhost:3000/api/admin/cms/revisions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ version: 999 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(404);
  });
});
