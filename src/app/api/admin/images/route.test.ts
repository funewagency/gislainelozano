import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSession = vi.fn();
vi.mock('next-auth', () => ({
  getServerSession: () => mockSession(),
}));

vi.mock('fs/promises', () => ({
  readdir: vi.fn(),
  stat: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  readLimiter: { check: vi.fn().mockReturnValue({ allowed: true }) },
  shouldRateLimit: vi.fn().mockReturnValue(false),
}));

import { GET } from './route';
import { readdir, stat } from 'fs/promises';

describe('GET /api/admin/images', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockSession.mockResolvedValue(null);
    const req = new Request('http://localhost:3000/api/admin/images');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns empty array when no images exist', async () => {
    mockSession.mockResolvedValue({ user: { name: 'Admin' } });
    (readdir as any).mockRejectedValue(new Error('ENOENT'));
    const req = new Request('http://localhost:3000/api/admin/images');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.images).toEqual([]);
  });

  it('returns filtered image files', async () => {
    mockSession.mockResolvedValue({ user: { name: 'Admin' } });
    (readdir as any).mockResolvedValue(['photo.jpg', 'doc.pdf', 'image.png', 'script.js']);
    (stat as any).mockImplementation((path: string) => {
      const sizes: Record<string, number> = {
        'photo.jpg': 1000,
        'image.png': 2000,
      };
      const dates: Record<string, string> = {
        'photo.jpg': '2024-01-02T00:00:00.000Z',
        'image.png': '2024-01-01T00:00:00.000Z',
      };
      const name = path.split('/').pop() || '';
      return Promise.resolve({
        size: sizes[name] || 0,
        mtime: new Date(dates[name] || '2024-01-01'),
      });
    });

    const req = new Request('http://localhost:3000/api/admin/images');
    const res = await GET(req);
    const body = await res.json();
    expect(body.images).toHaveLength(2);
    expect(body.images[0].name).toBe('photo.jpg');
    expect(body.images[1].name).toBe('image.png');
  });
});
