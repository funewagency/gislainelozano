import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockGetServerSession = vi.fn()
const mockCreate = vi.fn()
const mockCaptureException = vi.fn()
const mockTrackServerSide = vi.fn()

vi.mock('@/lib/db', () => ({
  db: {
    contact: {
      create: vi.fn().mockResolvedValue({ id: '1' }),
    },
  },
}))

vi.mock('@/lib/analytics-server', () => ({
  trackServerSide: mockTrackServerSide,
}))

vi.mock('@sentry/nextjs', () => ({
  captureException: mockCaptureException,
}))

describe('POST /api/contact', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  const makeRequest = (body: any) =>
    new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })

  it('returns 200 on valid submission', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true } as any))

    const { POST } = await import('./route')
    const request = makeRequest({
      name: 'João',
      email: 'joao@example.com',
      phone: '11999999999',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBeDefined()
  })

  it('returns 400 when name missing', async () => {
    const { POST } = await import('./route')
    const request = makeRequest({ email: 'joao@example.com', phone: '11999999999' })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('returns 400 when email missing', async () => {
    const { POST } = await import('./route')
    const request = makeRequest({ name: 'João', phone: '11999999999' })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('returns 400 when phone missing', async () => {
    const { POST } = await import('./route')
    const request = makeRequest({ name: 'João', email: 'joao@example.com' })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('returns 400 when email invalid', async () => {
    const { POST } = await import('./route')
    const request = makeRequest({ name: 'João', email: 'not-an-email', phone: '11999999999' })
    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.error).toContain('E-mail')
  })

  it('returns 400 when phone invalid', async () => {
    const { POST } = await import('./route')
    const request = makeRequest({ name: 'João', email: 'joao@example.com', phone: '123' })
    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.error).toContain('WhatsApp')
  })

  it('accepts phone with formatting (parens, dashes, spaces)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true } as any))
    const { POST } = await import('./route')
    const request = makeRequest({
      name: 'Maria',
      email: 'maria@example.com',
      phone: '(11) 99999-9999',
    })
    const response = await POST(request)
    expect(response.status).toBe(200)
  })

  it('calls trackServerSide with lead_created event', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true } as any))
    const { POST } = await import('./route')
    const request = makeRequest({
      name: 'João',
      email: 'joao@example.com',
      phone: '11999999999',
    })
    await POST(request)
    expect(mockTrackServerSide).toHaveBeenCalledWith(
      'lead_created',
      expect.objectContaining({ source: 'contact-form' }),
      expect.any(String),
    )
  })

  it('returns 200 even when CMS fetch fails (local save succeeds)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('CMS down')))
    const { POST } = await import('./route')
    const request = makeRequest({
      name: 'João',
      email: 'joao@example.com',
      phone: '11999999999',
    })
    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.syncedToCms).toBe(false)
  })

  it('includes marketing attribution fields in DB save', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true } as any))
    const { POST } = await import('./route')
    const request = makeRequest({
      name: 'João',
      email: 'joao@example.com',
      phone: '11999999999',
      source: 'google',
      medium: 'cpc',
      campaign: 'summer2026',
    })
    const response = await POST(request)
    expect(response.status).toBe(200)
  })

  it('logs DB error but still returns success (graceful degradation)', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { db } = await import('@/lib/db')
    vi.mocked(db.contact.create).mockRejectedValueOnce(new Error('DB error'))
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true } as any))
    const { POST } = await import('./route')
    const request = makeRequest({
      name: 'João',
      email: 'joao@example.com',
      phone: '11999999999',
    })
    const response = await POST(request)
    expect(response.status).toBe(200)
    expect(consoleError).toHaveBeenCalledWith(
      'Local DB save failed:',
      expect.any(Error),
    )
    consoleError.mockRestore()
  })

  it('returns 500 on unexpected server error', async () => {
    const originalJson = Request.prototype.json
    Request.prototype.json = vi.fn().mockRejectedValueOnce(new Error('Parse error'))
    const { POST } = await import('./route')
    const request = makeRequest({})
    const response = await POST(request)
    expect(response.status).toBe(500)
    expect(mockCaptureException).toHaveBeenCalled()
    Request.prototype.json = originalJson
  })

  it('returns 429 when rate limited', async () => {
    vi.resetModules()
    vi.doMock('@/lib/rate-limit', () => ({
      shouldRateLimit: () => true,
      contactLimiter: {
        check: () => ({ allowed: false, remaining: 0, resetIn: 30 }),
      },
    }))

    const { POST } = await import('./route')
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '1.1.1.1' },
      body: JSON.stringify({ name: 'X', email: 'x@x.com', phone: '11999999999' }),
    })
    const response = await POST(request)
    expect(response.status).toBe(429)
  })
})
