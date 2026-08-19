import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockFindUnique = vi.fn()

vi.mock('@/lib/db', () => ({
  db: {
    analyticsSetting: {
      findUnique: mockFindUnique,
    },
  },
}))

describe('GET /api/settings', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('returns settings from DB when available', async () => {
    mockFindUnique.mockResolvedValue({
      ga4Id: 'G-ABC123',
      fbPixelId: '1234567890',
      gAdsId: 'AW-XYZ',
      gAdsLabel: 'label1',
    })

    const { GET } = await import('./route')
    const request = new Request('http://localhost/api/settings')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ga4Id).toBe('G-ABC123')
    expect(data.fbPixelId).toBe('1234567890')
    expect(data.gAdsId).toBe('AW-XYZ')
    expect(data.gAdsLabel).toBe('label1')
  })

  it('returns nulls when no settings in DB', async () => {
    mockFindUnique.mockResolvedValue(null)

    const { GET } = await import('./route')
    const request = new Request('http://localhost/api/settings')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ga4Id).toBeNull()
    expect(data.fbPixelId).toBeNull()
    expect(data.gAdsId).toBeNull()
    expect(data.gAdsLabel).toBeNull()
  })

  it('returns nulls when DB throws', async () => {
    mockFindUnique.mockRejectedValue(new Error('DB error'))

    const { GET } = await import('./route')
    const request = new Request('http://localhost/api/settings')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ga4Id).toBeNull()
    expect(data.fbPixelId).toBeNull()
  })

  it('handles partial settings (only GA4)', async () => {
    mockFindUnique.mockResolvedValue({
      ga4Id: 'G-ABC',
      fbPixelId: null,
      gAdsId: null,
      gAdsLabel: null,
    })

    const { GET } = await import('./route')
    const request = new Request('http://localhost/api/settings')
    const response = await GET(request)
    const data = await response.json()

    expect(data.ga4Id).toBe('G-ABC')
    expect(data.fbPixelId).toBeNull()
  })

  it('returns 429 when rate limited', async () => {
    vi.resetModules()
    vi.doMock('@/lib/rate-limit', () => ({
      shouldRateLimit: () => true,
      readLimiter: {
        check: () => ({ allowed: false, remaining: 0, resetIn: 30 }),
      },
    }))

    const { GET } = await import('./route')
    const request = new Request('http://localhost/api/settings', {
      headers: { 'x-forwarded-for': '5.6.7.8' },
    })
    const response = await GET(request)
    expect(response.status).toBe(429)
  })
})
