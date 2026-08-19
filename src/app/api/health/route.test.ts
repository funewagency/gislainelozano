import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockFindUnique = vi.fn()

vi.mock('@/lib/db', () => ({
  db: {
    $queryRaw: vi.fn().mockResolvedValue([{ '1': 1 }]),
  },
}))

vi.mock('@/lib/env', () => ({
  checkEnv: vi.fn().mockReturnValue(true),
}))

describe('GET /api/health', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('returns 200 when all OK', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true } as any) as any
    const { GET } = await import('./route')

    const request = new Request('http://localhost/api/health')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)
    expect(data.db).toBe(true)
    expect(data.env).toBe(true)
    expect(data.timestamp).toBeDefined()
  })

  it('returns 503 when db is down', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.$queryRaw).mockRejectedValueOnce(new Error('DB down'))
    const { checkEnv } = await import('@/lib/env')
    vi.mocked(checkEnv).mockReturnValueOnce(true)
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true } as any) as any

    const { GET } = await import('./route')
    const request = new Request('http://localhost/api/health')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.ok).toBe(false)
    expect(data.db).toBe(false)
  })

  it('returns 503 when env is missing', async () => {
    const { checkEnv } = await import('@/lib/env')
    vi.mocked(checkEnv).mockReturnValueOnce(false)
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true } as any) as any

    const { GET } = await import('./route')
    const request = new Request('http://localhost/api/health')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.ok).toBe(false)
    expect(data.env).toBe(false)
  })

  it('handles CMS fetch failure gracefully', async () => {
    const { checkEnv } = await import('@/lib/env')
    vi.mocked(checkEnv).mockReturnValueOnce(true)
    const { db } = await import('@/lib/db')
    vi.mocked(db.$queryRaw).mockReset()
    vi.mocked(db.$queryRaw).mockResolvedValueOnce([{ '1': 1 }] as any)
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('CMS down')) as any

    const { GET } = await import('./route')
    const request = new Request('http://localhost/api/health')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.cms).toBe(false)
    expect(data.ok).toBe(true)
  })

  it('returns 429 when rate limited', async () => {
    vi.doMock('@/lib/rate-limit', () => ({
      shouldRateLimit: () => true,
      readLimiter: {
        check: () => ({ allowed: false, remaining: 0, resetIn: 30 }),
      },
    }))

    const { GET } = await import('./route')
    const request = new Request('http://localhost/api/health', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    })
    const response = await GET(request)
    expect(response.status).toBe(429)
  })
})
