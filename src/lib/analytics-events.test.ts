// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('trackAll', () => {
  let trackAll: typeof import('./analytics-events').trackAll
  let origGtag: any
  let origFbq: any

  beforeEach(async () => {
    vi.resetModules()
    const el = document.createElement('script')
    el.id = 'analytics-config'
    el.type = 'application/json'
    el.textContent = JSON.stringify({
      ga4Id: 'G-TEST',
      fbPixelId: '1234567890',
      gAdsId: 'AW-TEST',
      gAdsLabel: 'test_label',
    })
    document.body.appendChild(el)

    window.gtag = vi.fn()
    ;(window as any).fbq = vi.fn()
    ;(window as any).fbq.queue = []
    ;(window as any).fbq.push = vi.fn()
    ;(window as any).fbq.loaded = true
    ;(window as any).fbq.version = '2.0'
    ;(window as any).fbq.callMethod = vi.fn()

    const mod = await import('./analytics-events')
    trackAll = mod.trackAll
  })

  afterEach(() => {
    const el = document.getElementById('analytics-config')
    if (el) el.remove()
  })

  it('sends GA4 event for mapped events', () => {
    trackAll('whatsapp_click', { position: 'fab' })
    expect(window.gtag).toHaveBeenCalledWith('event', 'whatsapp_click', { position: 'fab' })
  })

  it('sends FB Pixel event for mapped events', () => {
    trackAll('whatsapp_click', { position: 'fab' })
    expect(window.fbq).toHaveBeenCalledWith('track', 'Contact', { position: 'fab' })
  })

  it('sends Google Ads conversion for whatsapp_click', () => {
    trackAll('whatsapp_click', { position: 'fab' })
    expect(window.gtag).toHaveBeenCalledWith('event', 'conversion', {
      send_to: 'AW-TEST/test_label',
      position: 'fab',
    })
  })

  it('does not send GA4 page_view', () => {
    trackAll('page_view', { path: '/' })
    expect(window.gtag).not.toHaveBeenCalled()
  })

  it('does nothing when config not present', () => {
    document.getElementById('analytics-config')!.remove()
    trackAll('whatsapp_click', {})
    expect(window.gtag).not.toHaveBeenCalled()
  })

  it('maps contact_form_success to FB CompleteRegistration', () => {
    trackAll('contact_form_success', {})
    expect(window.fbq).toHaveBeenCalledWith('track', 'CompleteRegistration', {})
  })
})
