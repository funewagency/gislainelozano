import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setTimeout } from 'timers/promises';
import { NextRequest } from 'next/server';

vi.mock('z-ai-web-dev-sdk', () => ({
  default: {
    create: vi.fn().mockResolvedValue({
      images: {
        generations: {
          create: vi.fn().mockResolvedValue({
            data: [{ base64: 'fake-base64-data' }],
          }),
        },
      },
    }),
  },
}));

vi.mock('fs', () => ({
  existsSync: vi.fn().mockReturnValue(true),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
  default: {
    existsSync: vi.fn().mockReturnValue(true),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
  },
}));

vi.mock('@/lib/rate-limit', () => ({
  generateLimiter: { check: vi.fn().mockReturnValue({ allowed: true }) },
  shouldRateLimit: vi.fn().mockReturnValue(false),
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

import { getServerSession } from 'next-auth';
import { POST } from './route';

describe('POST /api/generate-images', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects unauthorized request with 401', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null);
    const req = new NextRequest('http://localhost:3000/api/generate-images', { method: 'POST' });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns results array with all images when authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({ user: { name: 'admin', role: 'admin' } });
    const req = new NextRequest('http://localhost:3000/api/generate-images', { method: 'POST' });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.results).toBeDefined();
    expect(Array.isArray(body.results)).toBe(true);
    expect(body.results.length).toBeGreaterThan(0);
    body.results.forEach((r: any) => {
      expect(r.file).toBeDefined();
    });
  }, 30_000);
});
