// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('analytics init', () => {
  let initThirdPartyAnalytics: typeof import('./analytics-init').initThirdPartyAnalytics

  beforeEach(async () => {
    vi.resetModules()
    window.dataLayer = []
    window.gtag = vi.fn() as any
    ;(window as any).fbq = vi.fn()
    ;(window as any).fbq.queue = []
    ;(window as any).fbq.push = vi.fn()
    ;(window as any).fbq.callMethod = vi.fn()
    ;(window as any).fbq.loaded = true
    ;(window as any).fbq.version = '2.0'
    document.head.innerHTML = ''

    const mod = await import('./analytics-init')
    initThirdPartyAnalytics = mod.initThirdPartyAnalytics
  })

  afterEach(() => {
    document.head.innerHTML = ''
  })

  it('loads GA4 script', () => {
    initThirdPartyAnalytics({ ga4Id: 'G-TEST', fbPixelId: null, gAdsId: null, gAdsLabel: null })
    const script = document.querySelector('script[data-analytics="ga4"]') as HTMLScriptElement
    expect(script).not.toBeNull()
    expect(script?.src).toContain('gtag/js?id=G-TEST')
  })

  it('initializes GA4 dataLayer and gtag', () => {
    initThirdPartyAnalytics({ ga4Id: 'G-TEST', fbPixelId: null, gAdsId: null, gAdsLabel: null })
    expect(window.dataLayer).toEqual(
      expect.arrayContaining([
        ['js', expect.any(Date)],
        ['config', 'G-TEST', { send_page_view: false }],
      ]),
    )
  })

  it('loads Facebook Pixel script', () => {
    initThirdPartyAnalytics({ ga4Id: null, fbPixelId: '1234567890', gAdsId: null, gAdsLabel: null })
    const script = document.querySelector('script[data-analytics="fbpixel"]') as HTMLScriptElement
    expect(script).not.toBeNull()
    expect(script?.src).toContain('connect.facebook.net')
  })

  it('initializes Facebook Pixel with fbq("init")', () => {
    initThirdPartyAnalytics({ ga4Id: null, fbPixelId: '1234567890', gAdsId: null, gAdsLabel: null })
    expect((window as any).fbq.queue).toEqual(
      expect.arrayContaining([
        ['init', '1234567890'],
        ['track', 'PageView'],
      ]),
    )
  })

  it('loads Google Ads script', () => {
    initThirdPartyAnalytics({ ga4Id: null, fbPixelId: null, gAdsId: 'AW-TEST', gAdsLabel: null })
    const script = document.querySelector('script[data-analytics="gads"]') as HTMLScriptElement
    expect(script).not.toBeNull()
    expect(script?.src).toContain('gtag/js?id=AW-TEST')
  })

  it('initializes Google Ads gtag config', () => {
    initThirdPartyAnalytics({ ga4Id: null, fbPixelId: null, gAdsId: 'AW-TEST', gAdsLabel: 'label1' })
    expect(window.dataLayer).toEqual(
      expect.arrayContaining([
        ['js', expect.any(Date)],
        ['config', 'AW-TEST', { send_page_view: false }],
      ]),
    )
  })

  it('does not load duplicate GA4 script', () => {
    initThirdPartyAnalytics({ ga4Id: 'G-TEST', fbPixelId: null, gAdsId: null, gAdsLabel: null })
    initThirdPartyAnalytics({ ga4Id: 'G-TEST', fbPixelId: null, gAdsId: null, gAdsLabel: null })
    const scripts = document.querySelectorAll('script[data-analytics="ga4"]')
    expect(scripts.length).toBe(1)
  })

  it('handles partial config with only GA4', () => {
    initThirdPartyAnalytics({ ga4Id: 'G-TEST', fbPixelId: null, gAdsId: null, gAdsLabel: null })
    expect(document.querySelector('script[data-analytics="ga4"]')).not.toBeNull()
    expect(document.querySelector('script[data-analytics="fbpixel"]')).toBeNull()
    expect(document.querySelector('script[data-analytics="gads"]')).toBeNull()
  })

  it('handles partial config with only FB Pixel', () => {
    initThirdPartyAnalytics({ ga4Id: null, fbPixelId: '1234567890', gAdsId: null, gAdsLabel: null })
    expect(document.querySelector('script[data-analytics="fbpixel"]')).not.toBeNull()
    expect(document.querySelector('script[data-analytics="ga4"]')).toBeNull()
  })
})
