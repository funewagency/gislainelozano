// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest'

const mockFetch = vi.fn()

beforeEach(() => {
  vi.restoreAllMocks()
  global.fetch = mockFetch
  vi.clearAllMocks()
})

afterEach(() => {
  delete process.env.NEXT_PUBLIC_POSTHOG_HOST
  delete process.env.NEXT_PUBLIC_POSTHOG_API_KEY
  delete process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID
  delete process.env.POSTHOG_API_KEY
})

function makeQueryResponse(results: any[] = []) {
  return {
    ok: true,
    json: () => Promise.resolve({ results, columns: ['col'], types: ['String'] }),
  }
}

function setUpSixQueryMocks() {
  mockFetch
    .mockResolvedValueOnce(makeQueryResponse([]))
    .mockResolvedValueOnce(makeQueryResponse([]))
    .mockResolvedValueOnce(makeQueryResponse([]))
    .mockResolvedValueOnce(makeQueryResponse([]))
    .mockResolvedValueOnce(makeQueryResponse([]))
    .mockResolvedValueOnce(makeQueryResponse([]))
}

// ─── isPostHogConfigured ────────────────────────────────────────────

describe('isPostHogConfigured when key is set', () => {
  let mod: Awaited<typeof import('@/lib/posthog-api')>
  beforeAll(async () => {
    process.env.POSTHOG_API_KEY = 'phx_testkey'
    vi.resetModules()
    mod = await import('@/lib/posthog-api')
  })
  it('returns true', () => { expect(mod.isPostHogConfigured()).toBe(true) })
})

describe('isPostHogConfigured when key is not set', () => {
  let mod: Awaited<typeof import('@/lib/posthog-api')>
  beforeAll(async () => {
    vi.resetModules()
    mod = await import('@/lib/posthog-api')
  })
  it('returns false', () => { expect(mod.isPostHogConfigured()).toBe(false) })
})

describe('isPostHogConfigured when key is empty', () => {
  let mod: Awaited<typeof import('@/lib/posthog-api')>
  beforeAll(async () => {
    process.env.POSTHOG_API_KEY = ''
    vi.resetModules()
    mod = await import('@/lib/posthog-api')
  })
  it('returns false', () => { expect(mod.isPostHogConfigured()).toBe(false) })
})

// ─── fetchFromPostHog ───────────────────────────────────────────────

describe('fetchFromPostHog - correct host', () => {
  let mod: Awaited<typeof import('@/lib/posthog-api')>
  beforeAll(async () => {
    process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://eu.posthog.com'
    process.env.NEXT_PUBLIC_POSTHOG_API_KEY = 'phx_testkey'
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID = '12345'
    process.env.POSTHOG_API_KEY = 'phx_testkey'
    vi.resetModules()
    mod = await import('@/lib/posthog-api')
  })
  it('makes requests to the correct host', async () => {
    setUpSixQueryMocks()
    await mod.getPostHogAnalytics(30)
    for (const call of mockFetch.mock.calls) {
      expect(call[0]).toMatch(/^https:\/\/eu\.posthog\.com\//)
    }
  })
})

describe('fetchFromPostHog - Bearer auth', () => {
  let mod: Awaited<typeof import('@/lib/posthog-api')>
  beforeAll(async () => {
    process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://us.posthog.com'
    process.env.NEXT_PUBLIC_POSTHOG_API_KEY = 'phx_secretkey'
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID = '12345'
    process.env.POSTHOG_API_KEY = 'phx_secretkey'
    vi.resetModules()
    mod = await import('@/lib/posthog-api')
  })
  it('includes Bearer authorization header', async () => {
    setUpSixQueryMocks()
    await mod.getPostHogAnalytics()
    for (const call of mockFetch.mock.calls) {
      expect(call[1]?.headers?.Authorization).toBe('Bearer phx_secretkey')
    }
  })
})

describe('fetchFromPostHog - missing API key fallback', () => {
  let mod: Awaited<typeof import('@/lib/posthog-api')>
  beforeAll(async () => {
    process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://us.posthog.com'
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID = '12345'
    vi.resetModules()
    mod = await import('@/lib/posthog-api')
  })
  it('returns empty fallback when API key is missing', async () => {
    const result = await mod.getPostHogAnalytics()
    expect(result).toEqual({
      pageViews: { total: 0, trend: [] },
      uniqueVisitors: 0,
      topSources: [],
      topPages: [],
      recentEvents: [],
      conversionFunnel: [],
    })
  })
})

describe('fetchFromPostHog - API error', () => {
  let mod: Awaited<typeof import('@/lib/posthog-api')>
  beforeAll(async () => {
    process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://us.posthog.com'
    process.env.NEXT_PUBLIC_POSTHOG_API_KEY = 'phx_testkey'
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID = '12345'
    process.env.POSTHOG_API_KEY = 'phx_testkey'
    vi.resetModules()
    mod = await import('@/lib/posthog-api')
  })
  it('handles API error responses gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('network error'))
    const result = await mod.getPostHogAnalytics()
    expect(result).toEqual({
      pageViews: { total: 0, trend: [] },
      uniqueVisitors: 0,
      topSources: [],
      topPages: [],
      recentEvents: [],
      conversionFunnel: [],
    })
  })
})

// ─── getPostHogAnalytics ────────────────────────────────────────────

describe('getPostHogAnalytics full data shape', () => {
  let mod: Awaited<typeof import('@/lib/posthog-api')>
  beforeAll(async () => {
    process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://us.posthog.com'
    process.env.NEXT_PUBLIC_POSTHOG_API_KEY = 'phx_testkey'
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID = '12345'
    process.env.POSTHOG_API_KEY = 'phx_testkey'
    vi.resetModules()
    mod = await import('@/lib/posthog-api')
  })
  it('returns expected shape with full data', async () => {
    // Mock the 6 HogQL queries that getPostHogAnalytics makes
    mockFetch
      // 1. Page views trend: returns rows with [day, count]
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({
        results: [['2024-01-01', '100'], ['2024-01-02', '150']],
        columns: ['day', 'count'], types: ['String', 'UInt64'],
      })})
      // 2. Unique visitors: returns rows with [count]
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({
        results: [['75']],
        columns: ['count'], types: ['UInt64'],
      })})
      // 3. Top pages: returns rows with [path, views]
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({
        results: [['/', '120'], ['/servicos', '80']],
        columns: ['path', 'views'], types: ['String', 'UInt64'],
      })})
      // 4. Top sources: returns rows with [source, count]
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({
        results: [['google', '60'], ['direct', '40']],
        columns: ['source', 'count'], types: ['String', 'UInt64'],
      })})
      // 5. Recent events: returns rows with [event, count]
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({
        results: [['button_click', '25'], ['form_submit', '10']],
        columns: ['event', 'count'], types: ['String', 'UInt64'],
      })})
      // 6. Conversion funnel: returns rows with [event, count]
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({
        results: [['$pageview', '200'], ['whatsapp_click', '30'], ['contact_form_started', '15'], ['contact_form_submitted', '8'], ['lead_created', '5']],
        columns: ['event', 'count'], types: ['String', 'UInt64'],
      })})

    const result = await mod.getPostHogAnalytics(30)
    expect(result.pageViews.total).toBe(250)
    expect(result.pageViews.trend).toHaveLength(2)
    expect(result.pageViews.trend[0]).toEqual({ date: '2024-01-01', count: 100 })
    expect(result.uniqueVisitors).toBe(75)
    expect(result.topPages).toHaveLength(2)
    expect(result.topPages[0]).toEqual({ path: '/', views: 120 })
    expect(result.topSources).toHaveLength(2)
    expect(result.topSources[0]).toEqual({ source: 'google', count: 60 })
    expect(result.recentEvents).toHaveLength(2)
    expect(result.recentEvents[0]).toEqual({ event: 'button_click', count: 25 })
    expect(result.conversionFunnel).toHaveLength(5)
    expect(result.conversionFunnel[0]).toEqual({ step: 'Pageview', count: 200 })
    expect(result.conversionFunnel[4]).toEqual({ step: 'Lead Created', count: 5 })
  })
})

describe('getPostHogAnalytics network error', () => {
  let mod: Awaited<typeof import('@/lib/posthog-api')>
  beforeAll(async () => {
    process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://us.posthog.com'
    process.env.NEXT_PUBLIC_POSTHOG_API_KEY = 'phx_testkey'
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID = '12345'
    process.env.POSTHOG_API_KEY = 'phx_testkey'
    vi.resetModules()
    mod = await import('@/lib/posthog-api')
  })
  it('returns empty data on network error', async () => {
    mockFetch.mockRejectedValue(new Error('network error'))
    const result = await mod.getPostHogAnalytics()
    expect(result).toEqual({
      pageViews: { total: 0, trend: [] }, uniqueVisitors: 0,
      topSources: [], topPages: [], recentEvents: [], conversionFunnel: [],
    })
  })
})

describe('getPostHogAnalytics empty results', () => {
  let mod: Awaited<typeof import('@/lib/posthog-api')>
  beforeAll(async () => {
    process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://us.posthog.com'
    process.env.NEXT_PUBLIC_POSTHOG_API_KEY = 'phx_testkey'
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID = '12345'
    process.env.POSTHOG_API_KEY = 'phx_testkey'
    vi.resetModules()
    mod = await import('@/lib/posthog-api')
  })
  it('returns empty data for empty results', async () => {
    setUpSixQueryMocks()
    const result = await mod.getPostHogAnalytics()
    expect(result.pageViews.total).toBe(0)
    expect(result.pageViews.trend).toEqual([])
    expect(result.uniqueVisitors).toBe(0)
    expect(result.topPages).toEqual([])
    expect(result.topSources).toEqual([])
    expect(result.recentEvents).toEqual([])
    expect(result.conversionFunnel).toEqual([
      { step: 'Pageview', count: 0 }, { step: 'Whatsapp Click', count: 0 },
      { step: 'Contact Form Started', count: 0 }, { step: 'Contact Form Submitted', count: 0 },
      { step: 'Lead Created', count: 0 },
    ])
  })
})

// ─── runHogQL ───────────────────────────────────────────────────────

describe('runHogQL - sends HogQL queries', () => {
  let mod: Awaited<typeof import('@/lib/posthog-api')>
  beforeAll(async () => {
    process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://us.posthog.com'
    process.env.NEXT_PUBLIC_POSTHOG_API_KEY = 'phx_testkey'
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID = '12345'
    process.env.POSTHOG_API_KEY = 'phx_testkey'
    vi.resetModules()
    mod = await import('@/lib/posthog-api')
  })
  it('sends HogQL queries in the request body', async () => {
    setUpSixQueryMocks()
    await mod.getPostHogAnalytics(30)
    for (const call of mockFetch.mock.calls) {
      expect(call[1].method).toBe('POST')
      const body = JSON.parse(call[1].body)
      expect(body.query).toHaveProperty('kind', 'HogQLQuery')
      expect(body.query).toHaveProperty('query')
      expect(typeof body.query.query).toBe('string')
      expect(body.query.query.length).toBeGreaterThan(0)
    }
  })
})

describe('runHogQL - project ID in URL', () => {
  let mod: Awaited<typeof import('@/lib/posthog-api')>
  beforeAll(async () => {
    process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://us.posthog.com'
    process.env.NEXT_PUBLIC_POSTHOG_API_KEY = 'phx_testkey'
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID = 'project_999'
    process.env.POSTHOG_API_KEY = 'phx_testkey'
    vi.resetModules()
    mod = await import('@/lib/posthog-api')
  })
  it('includes the project ID in the URL path', async () => {
    setUpSixQueryMocks()
    await mod.getPostHogAnalytics()
    for (const call of mockFetch.mock.calls) {
      expect(call[0]).toContain('/api/projects/project_999/query/')
    }
  })
})

describe('runHogQL - page views query construction', () => {
  let mod: Awaited<typeof import('@/lib/posthog-api')>
  beforeAll(async () => {
    process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://us.posthog.com'
    process.env.NEXT_PUBLIC_POSTHOG_API_KEY = 'phx_testkey'
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID = '123'
    process.env.POSTHOG_API_KEY = 'phx_testkey'
    vi.resetModules()
    mod = await import('@/lib/posthog-api')
  })
  it('constructs page views trend HogQL query correctly', async () => {
    setUpSixQueryMocks()
    await mod.getPostHogAnalytics(30)
    const firstCallBody = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(firstCallBody.query.query).toContain('toStartOfDay(timestamp)')
    expect(firstCallBody.query.query).toContain("event = '$pageview'")
    expect(firstCallBody.query.query).toContain('INTERVAL 30 DAY')
    expect(firstCallBody.query.query).toContain('GROUP BY day')
    expect(firstCallBody.query.query).toContain('ORDER BY day ASC')
  })
})
