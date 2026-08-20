import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockGetServerSession = vi.fn()
const mockSharp = vi.fn()

vi.mock('next-auth', () => ({
  getServerSession: mockGetServerSession,
}))

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}))

vi.mock('sharp', () => {
  return {
    default: vi.fn(() => ({
      resize: vi.fn().mockReturnThis(),
      webp: vi.fn().mockReturnThis(),
      toFile: vi.fn().mockResolvedValue({}),
    })),
  }
})

vi.mock('fs/promises', () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
}))

describe('POST /api/admin/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const { POST } = await import('./route')
    const formData = new FormData()
    const request = new Request('http://localhost/api/admin/upload', {
      method: 'POST',
      body: formData,
    })
    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it('returns 400 when no file is provided', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: '1' } })

    const { POST } = await import('./route')
    const formData = new FormData()
    const request = new Request('http://localhost/api/admin/upload', {
      method: 'POST',
      body: formData,
    })
    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.error).toContain('Nenhum arquivo')
  })

  it('returns 400 for empty file', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: '1' } })

    const { POST } = await import('./route')
    const formData = new FormData()
    const file = new File([''], 'test.png', { type: 'image/png' })
    Object.defineProperty(file, 'size', { value: 0 })
    formData.append('file', file)
    const request = new Request('http://localhost/api/admin/upload', {
      method: 'POST',
      body: formData,
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('returns 400 for invalid file type', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: '1' } })

    const { POST } = await import('./route')
    const formData = new FormData()
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    formData.append('file', file)
    const request = new Request('http://localhost/api/admin/upload', {
      method: 'POST',
      body: formData,
    })
    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.error).toContain('Tipo de arquivo')
  })

  it('returns 400 for file too large', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: '1' } })

    const { POST } = await import('./route')
    const formData = new FormData()
    const bigContent = 'x'.repeat(11 * 1024 * 1024)
    const file = new File([bigContent], 'big.png', { type: 'image/png' })
    formData.append('file', file)
    const request = new Request('http://localhost/api/admin/upload', {
      method: 'POST',
      body: formData,
    })
    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.error).toContain('muito grande')
  })

  it('processes valid JPEG through Sharp', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: '1' } })

    const { POST } = await import('./route')
    const formData = new FormData()
    const validJpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01])
    const file = new File([validJpegBytes], 'test.jpg', { type: 'image/jpeg' })
    formData.append('file', file)
    const request = new Request('http://localhost/api/admin/upload', {
      method: 'POST',
      body: formData,
    })
    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.url).toContain('/uploads/')
    expect(data.filename).toMatch(/\.webp$/)
  })

  it('processes valid PNG through Sharp', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: '1' } })

    const { POST } = await import('./route')
    const formData = new FormData()
    const validPngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d])
    const file = new File([validPngBytes], 'test.png', { type: 'image/png' })
    formData.append('file', file)
    const request = new Request('http://localhost/api/admin/upload', {
      method: 'POST',
      body: formData,
    })
    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.filename).toMatch(/\.webp$/)
  })

  it('passes through GIF without Sharp', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: '1' } })

    const { POST } = await import('./route')
    const formData = new FormData()
    const validGifBytes = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00])
    const file = new File([validGifBytes], 'anim.gif', { type: 'image/gif' })
    formData.append('file', file)
    const request = new Request('http://localhost/api/admin/upload', {
      method: 'POST',
      body: formData,
    })
    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.filename).toMatch(/\.gif$/)
  })

  it('sanitizes filename (special chars replaced)', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: '1' } })

    const { POST } = await import('./route')
    const formData = new FormData()
    const validJpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01])
    const file = new File([validJpegBytes], 'meu arquivo (1)!.jpg', { type: 'image/jpeg' })
    formData.append('file', file)
    const request = new Request('http://localhost/api/admin/upload', {
      method: 'POST',
      body: formData,
    })
    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.filename).not.toContain(' ')
    expect(data.filename).not.toContain('(')
    expect(data.filename).not.toContain('!')
  })

  it('returns 429 when rate limited', async () => {
    vi.resetModules()
    vi.doMock('@/lib/rate-limit', () => ({
      mutationLimiter: {
        check: () => ({ allowed: false, remaining: 0, resetIn: 30 }),
      },
    }))

    const { POST } = await import('./route')
    const formData = new FormData()
    const request = new Request('http://localhost/api/admin/upload', {
      method: 'POST',
      body: formData,
      headers: { 'x-forwarded-for': '9.9.9.9' },
    })
    const response = await POST(request)
    expect(response.status).toBe(429)
  })
})
