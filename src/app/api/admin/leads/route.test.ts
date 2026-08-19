import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { shouldRateLimit, mutationLimiter } from '@/lib/rate-limit';

const mockSession = vi.hoisted(() => vi.fn());
vi.mock('next-auth', () => ({
  getServerSession: () => mockSession(),
}));

const mockDb = vi.hoisted(() => ({
  contact: {
    findMany: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
    deleteMany: vi.fn(),
  },
}));
vi.mock('@/lib/db', () => ({ db: mockDb }));

vi.mock('@/lib/rate-limit', () => ({
  readLimiter: { check: vi.fn().mockReturnValue({ allowed: true }) },
  mutationLimiter: { check: vi.fn().mockReturnValue({ allowed: true }) },
  shouldRateLimit: vi.fn().mockReturnValue(false),
}));

import { GET, DELETE } from './route';

describe('GET /api/admin/leads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession.mockResolvedValue({ user: { name: 'Admin' } });
    mockDb.contact.groupBy.mockResolvedValue([]);
  });

  it('returns 401 when not authenticated', async () => {
    mockSession.mockResolvedValue(null);
    const req = new NextRequest('http://localhost:3000/api/admin/leads');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns paginated leads', async () => {
    mockDb.contact.findMany.mockResolvedValue([
      { id: '1', name: 'Maria', email: 'maria@test.com', phone: '11999999999', message: null, source: 'contact-form', createdAt: new Date().toISOString() },
    ]);
    mockDb.contact.count.mockResolvedValue(1);

    const req = new NextRequest('http://localhost:3000/api/admin/leads?page=1&limit=10');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.leads).toHaveLength(1);
    expect(body.pagination.total).toBe(1);
    expect(body.pagination.page).toBe(1);
  });

  it('enforces max page limit of 500', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/leads?page=501');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it('enforces max limit of 100', async () => {
    mockDb.contact.findMany.mockResolvedValue([]);
    mockDb.contact.count.mockResolvedValue(0);
    const req = new NextRequest('http://localhost:3000/api/admin/leads?limit=200');
    await GET(req);
    expect(mockDb.contact.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 }),
    );
  });

  it('passes search query to Prisma', async () => {
    mockDb.contact.findMany.mockResolvedValue([]);
    mockDb.contact.count.mockResolvedValue(0);
    const req = new NextRequest('http://localhost:3000/api/admin/leads?search=Maria');
    await GET(req);
    expect(mockDb.contact.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ OR: expect.any(Array) }),
      }),
    );
  });

  it('skips row fetch when stats=true', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/leads?limit=1&stats=true');
    await GET(req);
    expect(mockDb.contact.findMany).not.toHaveBeenCalled();
  });
});

describe('DELETE /api/admin/leads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession.mockResolvedValue({ user: { name: 'Admin' } });
    mockDb.contact.groupBy.mockResolvedValue([]);
    // Default: the requested leads exist in the DB.
    mockDb.contact.count.mockResolvedValue(1);
  });

  function jsonRequest(body?: unknown, url = 'http://localhost:3000/api/admin/leads') {
    const init: RequestInit = { method: 'DELETE' };
    if (body !== undefined) {
      init.headers = { 'Content-Type': 'application/json' };
      init.body = JSON.stringify(body);
    }
    return new NextRequest(url, init);
  }

  it('returns 401 when not authenticated', async () => {
    mockSession.mockResolvedValue(null);
    const res = await DELETE(jsonRequest({ ids: ['1'] }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when no ids are provided', async () => {
    const res = await DELETE(jsonRequest());
    expect(res.status).toBe(400);
  });

  it('returns 400 when ids array is empty', async () => {
    const res = await DELETE(jsonRequest({ ids: [] }));
    expect(res.status).toBe(400);
  });

  it('deletes multiple leads by ids', async () => {
    mockDb.contact.deleteMany.mockResolvedValue({ count: 2 });
    const res = await DELETE(jsonRequest({ ids: ['1', '2'] }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.deleted).toBe(2);
    expect(body.requested).toBe(2);
    expect(mockDb.contact.deleteMany).toHaveBeenCalledWith({ where: { id: { in: ['1', '2'] } } });
  });

  it('deletes a single lead via ?id= query param', async () => {
    mockDb.contact.deleteMany.mockResolvedValue({ count: 1 });
    const res = await DELETE(new NextRequest('http://localhost:3000/api/admin/leads?id=42', { method: 'DELETE' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.deleted).toBe(1);
    expect(mockDb.contact.deleteMany).toHaveBeenCalledWith({ where: { id: { in: ['42'] } } });
  });

  it('returns deleted=0 when no leads match', async () => {
    mockDb.contact.count.mockResolvedValue(0);
    mockDb.contact.deleteMany.mockResolvedValue({ count: 0 });
    const res = await DELETE(jsonRequest({ ids: ['missing'] }));
    const body = await res.json();
    expect(body.deleted).toBe(0);
  });

  it('returns 429 when rate limited', async () => {
    vi.mocked(shouldRateLimit).mockReturnValue(true);
    vi.mocked(mutationLimiter.check).mockReturnValue({ allowed: false, remaining: 0 });
    const res = await DELETE(jsonRequest({ ids: ['1'] }));
    expect(res.status).toBe(429);
  });
});
