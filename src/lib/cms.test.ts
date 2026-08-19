// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFetch = vi.fn()
const mockReadFileSync = vi.fn()
const mockWriteFileSync = vi.fn()

vi.mock('fs', () => ({
  default: { readFileSync: mockReadFileSync, writeFileSync: mockWriteFileSync },
  readFileSync: mockReadFileSync,
  writeFileSync: mockWriteFileSync,
}))

beforeEach(() => {
  vi.restoreAllMocks()
  vi.clearAllMocks()
  mockReadFileSync.mockReset()
  mockWriteFileSync.mockReset()
  global.fetch = mockFetch
  process.env.NEXT_PUBLIC_CMS_URL = 'http://test-cms:3001'
  process.env.NEXT_PUBLIC_TENANT_SLUG = 'test-tenant'
})

function makeResponse(data: unknown) {
  return { ok: true, status: 200, json: () => Promise.resolve({ data }) }
}

function makePersistentFetchResponse() {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ data: { tenant: { name: 'Gislaine', slug: 'gislaine', siteType: 'landing' }, config: {} } }),
  })
}

describe('getSiteConfig', () => {
  it('returns fetched data and caches it (second call uses cache, no fetch)', async () => {
    mockFetch.mockImplementation(makePersistentFetchResponse)
    const { getSiteConfig, clearCache } = await import('@/lib/cms')
    clearCache()

    await getSiteConfig()
    expect(mockFetch).toHaveBeenCalledTimes(1)

    await getSiteConfig()
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('fetches again after cache is cleared', async () => {
    mockFetch.mockImplementation(makePersistentFetchResponse)
    const { getSiteConfig, clearCache } = await import('@/lib/cms')
    clearCache()

    await getSiteConfig()
    expect(mockFetch).toHaveBeenCalledTimes(1)

    clearCache()
    await getSiteConfig()
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })
})

describe('retry on failure', () => {
  it('retries on fetch failure up to 3 times then throws', async () => {
    mockFetch.mockRejectedValue(new Error('network error'))
    const { getSiteConfig, clearCache } = await import('@/lib/cms')
    clearCache()
    await expect(getSiteConfig()).rejects.toThrow('network error')
    expect(mockFetch).toHaveBeenCalledTimes(3)
  })

  it('succeeds on retry after initial failure', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('network error'))
      .mockImplementation(makePersistentFetchResponse)
    const { getSiteConfig, clearCache } = await import('@/lib/cms')
    clearCache()
    const result = await getSiteConfig()
    expect(result.tenant.name).toBe('Gislaine')
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('uses persisted cache fallback when all retries fail', async () => {
    mockReadFileSync.mockReturnValue(
      JSON.stringify({
        'config:test-tenant': {
          data: { tenant: { name: 'Persisted', slug: 'gislaine', siteType: 'landing' }, config: {} },
          timestamp: Date.now(),
        },
      })
    )
    mockFetch.mockRejectedValue(new Error('network error'))
    const { getSiteConfig, clearCache } = await import('@/lib/cms')
    clearCache()
    const result = await getSiteConfig()
    expect(result.tenant.name).toBe('Persisted')
    expect(mockFetch).toHaveBeenCalledTimes(3)
  })

  it('throws when persisted cache is also unavailable', async () => {
    mockReadFileSync.mockImplementation(() => { throw new Error('file not found') })
    mockFetch.mockRejectedValue(new Error('network error'))
    const { getSiteConfig, clearCache } = await import('@/lib/cms')
    clearCache()
    await expect(getSiteConfig()).rejects.toThrow('network error')
  })
})

describe('getServices', () => {
  it('returns parsed service data', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve(makeResponse([
        { id: '1', title: 'Mentoria Individual', subtitle: null, description: null, price: null, features: null, ctaUrl: null, ctaText: null, sortOrder: 1, published: true },
      ]))
    )
    const { getServices, clearCache } = await import('@/lib/cms')
    clearCache()
    const result = await getServices()
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Mentoria Individual')
  })
})

describe('getTestimonials', () => {
  it('returns parsed testimonial data', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve(makeResponse([
        { id: '1', name: 'Ana', company: 'Tech Co', role: 'CEO', text: 'Ótimo serviço!', rating: 5, avatarUrl: null },
      ]))
    )
    const { getTestimonials, clearCache } = await import('@/lib/cms')
    clearCache()
    const result = await getTestimonials()
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Ana')
  })
})

describe('getFaqs', () => {
  it('returns parsed FAQ data', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve(makeResponse([
        { id: '1', question: 'Como funciona?', answer: 'Simples.', sortOrder: 1 },
      ]))
    )
    const { getFaqs, clearCache } = await import('@/lib/cms')
    clearCache()
    const result = await getFaqs()
    expect(result).toHaveLength(1)
    expect(result[0].question).toBe('Como funciona?')
  })
})

describe('getSections', () => {
  it('fetches all sections', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve(makeResponse([
        { id: 's1', type: 'hero', title: 'Hero', config: {}, sortOrder: 1, published: true, contentBlocks: [] },
      ]))
    )
    const { getSections, clearCache } = await import('@/lib/cms')
    clearCache()
    const result = await getSections()
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('hero')
  })

  it('fetches sections filtered by type', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve(makeResponse([
        { id: 's1', type: 'hero', title: 'Hero', config: {}, sortOrder: 1, published: true, contentBlocks: [] },
      ]))
    )
    const { getSections, clearCache } = await import('@/lib/cms')
    clearCache()
    const result = await getSections('hero')
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Hero')
  })
})

describe('submitLead', () => {
  it('returns true on successful submission', async () => {
    mockFetch.mockResolvedValue({ ok: true })
    const { submitLead } = await import('@/lib/cms')
    const result = await submitLead({ name: 'João', email: 'joao@test.com', phone: '11999999999' })
    expect(result).toBe(true)
  })

  it('returns false on non-ok response', async () => {
    mockFetch.mockResolvedValue({ ok: false })
    const { submitLead } = await import('@/lib/cms')
    const result = await submitLead({ name: 'A', email: 'a@a.com', phone: '1' })
    expect(result).toBe(false)
  })

  it('returns false on network error', async () => {
    mockFetch.mockRejectedValue(new Error('network'))
    const { submitLead } = await import('@/lib/cms')
    const result = await submitLead({ name: 'A', email: 'a@a.com', phone: '1' })
    expect(result).toBe(false)
  })
})

describe('clearCache', () => {
  it('empties the in-memory cache', async () => {
    mockFetch.mockImplementation(makePersistentFetchResponse)
    const { getSiteConfig, clearCache } = await import('@/lib/cms')
    clearCache()

    await getSiteConfig()
    expect(mockFetch).toHaveBeenCalledTimes(1)

    clearCache()

    await getSiteConfig()
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })
})
