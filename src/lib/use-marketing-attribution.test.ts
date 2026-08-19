import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const STORAGE_KEY = 'gislaine_marketing_attribution'

// Setup DOM-like globals needed by the module
let referrerValue = ''
function mockDomGlobals() {
  // document mock with configurable referrer
  const doc: any = {}
  Object.defineProperty(doc, 'referrer', {
    get: () => referrerValue,
    configurable: true,
  })
  vi.stubGlobal('document', doc)
  vi.stubGlobal('sessionStorage', createStorageMock())
}

function createStorageMock() {
  const store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, val: string) => { store[key] = val }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]) }),
    get length() { return Object.keys(store).length },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
  }
}

beforeEach(() => {
  referrerValue = ''
  const url = new URL('http://localhost/')
  vi.stubGlobal('window', { location: { href: url.href, search: url.search } })
  vi.stubGlobal('location', { search: url.search, href: url.href })
  vi.stubGlobal('URLSearchParams', URLSearchParams)
  mockDomGlobals()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function setSearchParams(queryString: string) {
  const url = new URL(`http://localhost${queryString ? '?' + queryString : ''}`)
  vi.stubGlobal('window', { location: { href: url.href, search: url.search } })
  vi.stubGlobal('location', { search: url.search, href: url.href })
}

function setReferrer(url: string) {
  referrerValue = url
  // Re-apply document mock to use updated referrerValue
  const doc: any = {}
  Object.defineProperty(doc, 'referrer', { get: () => referrerValue, configurable: true })
  vi.stubGlobal('document', doc)
}

describe('parseUtmParams (via getMarketingAttribution)', () => {
  it('parses all 5 UTM params from the URL', async () => {
    setSearchParams('utm_source=google&utm_medium=cpc&utm_campaign=spring&utm_term=buy+now&utm_content=banner1')
    const { getMarketingAttribution } = await import('@/lib/use-marketing-attribution')
    const result = getMarketingAttribution()
    expect(result.source).toBe('google')
    expect(result.medium).toBe('cpc')
    expect(result.campaign).toBe('spring')
    expect(result.term).toBe('buy now')
    expect(result.content).toBe('banner1')
  })

  it('returns nulls/fallback for absent UTM params', async () => {
    setSearchParams('')
    setReferrer('')
    const { getMarketingAttribution } = await import('@/lib/use-marketing-attribution')
    const result = getMarketingAttribution()
    expect(result.source).toBe('direct')
    expect(result.medium).toBeNull()
    expect(result.campaign).toBeNull()
    expect(result.term).toBeNull()
    expect(result.content).toBeNull()
  })

  it('handles partial UTM params', async () => {
    setSearchParams('utm_source=facebook&utm_campaign=launch')
    const { getMarketingAttribution } = await import('@/lib/use-marketing-attribution')
    const result = getMarketingAttribution()
    expect(result.source).toBe('facebook')
    expect(result.medium).toBeNull()
    expect(result.campaign).toBe('launch')
    expect(result.term).toBeNull()
    expect(result.content).toBeNull()
  })

  it('decodes URL-encoded UTM values', async () => {
    setSearchParams('utm_source=google&utm_term=buy+now&utm_content=cta%21')
    const { getMarketingAttribution } = await import('@/lib/use-marketing-attribution')
    const result = getMarketingAttribution()
    expect(result.term).toBe('buy now')
    expect(result.content).toBe('cta!')
  })
})

describe('getReferrerSource', () => {
  it('returns "google" for google.com referrer', async () => {
    setSearchParams('')
    setReferrer('https://www.google.com/search?q=gislaine')
    const { getMarketingAttribution } = await import('@/lib/use-marketing-attribution')
    expect(getMarketingAttribution().source).toBe('google')
  })

  it('returns "facebook" for facebook.com referrer', async () => {
    setSearchParams('')
    setReferrer('https://www.facebook.com/some-page')
    const { getMarketingAttribution } = await import('@/lib/use-marketing-attribution')
    expect(getMarketingAttribution().source).toBe('facebook')
  })

  it('returns "facebook" for fb.com referrer', async () => {
    setSearchParams('')
    setReferrer('https://fb.com/some-link')
    const { getMarketingAttribution } = await import('@/lib/use-marketing-attribution')
    expect(getMarketingAttribution().source).toBe('facebook')
  })

  it('returns "instagram" for instagram.com referrer', async () => {
    setSearchParams('')
    setReferrer('https://www.instagram.com/p/abc123/')
    const { getMarketingAttribution } = await import('@/lib/use-marketing-attribution')
    expect(getMarketingAttribution().source).toBe('instagram')
  })

  it('returns "tiktok" for tiktok.com referrer', async () => {
    setSearchParams('')
    setReferrer('https://www.tiktok.com/@user')
    const { getMarketingAttribution } = await import('@/lib/use-marketing-attribution')
    expect(getMarketingAttribution().source).toBe('tiktok')
  })

  it('returns "youtube" for youtube.com referrer', async () => {
    setSearchParams('')
    setReferrer('https://www.youtube.com/watch?v=abc')
    const { getMarketingAttribution } = await import('@/lib/use-marketing-attribution')
    expect(getMarketingAttribution().source).toBe('youtube')
  })

  it('returns "linkedin" for linkedin.com referrer', async () => {
    setSearchParams('')
    setReferrer('https://www.linkedin.com/in/user')
    const { getMarketingAttribution } = await import('@/lib/use-marketing-attribution')
    expect(getMarketingAttribution().source).toBe('linkedin')
  })

  it('returns "twitter" for twitter.com referrer', async () => {
    setSearchParams('')
    setReferrer('https://twitter.com/user/status/123')
    const { getMarketingAttribution } = await import('@/lib/use-marketing-attribution')
    expect(getMarketingAttribution().source).toBe('twitter')
  })

  it('returns "twitter" for x.com referrer', async () => {
    setSearchParams('')
    setReferrer('https://x.com/user')
    const { getMarketingAttribution } = await import('@/lib/use-marketing-attribution')
    expect(getMarketingAttribution().source).toBe('twitter')
  })

  it('returns "direct" when referrer is empty', async () => {
    setSearchParams('')
    setReferrer('')
    const { getMarketingAttribution } = await import('@/lib/use-marketing-attribution')
    expect(getMarketingAttribution().source).toBe('direct')
  })

  it('returns the full referrer URL for unknown sources', async () => {
    setSearchParams('')
    setReferrer('https://some-unknown-blog.com/article')
    const { getMarketingAttribution } = await import('@/lib/use-marketing-attribution')
    expect(getMarketingAttribution().source).toBe('https://some-unknown-blog.com/article')
  })
})

describe('getMarketingAttribution', () => {
  it('returns UTM source over referrer when UTM is present', async () => {
    setSearchParams('utm_source=newsletter')
    setReferrer('https://www.google.com/search?q=gislaine')
    const { getMarketingAttribution } = await import('@/lib/use-marketing-attribution')
    const result = getMarketingAttribution()
    expect(result.source).toBe('newsletter')
  })

  it('uses referrer when UTM source is absent but medium is present', async () => {
    setSearchParams('utm_medium=email')
    setReferrer('https://www.linkedin.com/in/user')
    const { getMarketingAttribution } = await import('@/lib/use-marketing-attribution')
    const result = getMarketingAttribution()
    expect(result.source).toBe('linkedin')
    expect(result.medium).toBe('email')
  })

  it('caches the result in sessionStorage', async () => {
    setSearchParams('utm_source=google&utm_medium=cpc')
    const { getMarketingAttribution } = await import('@/lib/use-marketing-attribution')
    const first = getMarketingAttribution()
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeTruthy()
    expect(first.source).toBe('google')

    // Change params to verify cache is used
    setSearchParams('utm_source=changed')
    const second = getMarketingAttribution()
    expect(second.source).toBe('google') // still cached
  })

  it('returns cached data from sessionStorage on subsequent calls', async () => {
    const cached = { source: 'cached-source', medium: 'cached-medium', campaign: null, term: null, content: null }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cached))
    const { getMarketingAttribution } = await import('@/lib/use-marketing-attribution')
    const result = getMarketingAttribution()
    expect(result).toEqual(cached)
  })

  it('handles corrupt sessionStorage cache gracefully', async () => {
    sessionStorage.setItem(STORAGE_KEY, '{corrupt}')
    setSearchParams('utm_source=email')
    const { getMarketingAttribution } = await import('@/lib/use-marketing-attribution')
    const result = getMarketingAttribution()
    expect(result.source).toBe('email')
  })
})
