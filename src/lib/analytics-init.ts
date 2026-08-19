'use client'

interface AnalyticsConfig {
  ga4Id?: string | null
  fbPixelId?: string | null
  gAdsId?: string | null
  gAdsLabel?: string | null
  gAdsSendTo?: string | null
}

export function initThirdPartyAnalytics(config: AnalyticsConfig) {
  if (config.ga4Id) loadGA4(config.ga4Id)
  if (config.fbPixelId) loadFacebookPixel(config.fbPixelId)
  if (config.gAdsId) loadGoogleAds(config.gAdsId, config.gAdsLabel ?? undefined)
}

function loadGA4(id: string) {
  if (document.querySelector(`script[data-analytics="ga4"]`)) return
  const url = `https://www.googletagmanager.com/gtag/js?id=${id}`
  const script = document.createElement('script')
  script.src = url
  script.async = true
  script.setAttribute('data-analytics', 'ga4')
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args)
  }
  window.gtag('js', new Date())
  window.gtag('config', id, { send_page_view: false })
}

function loadFacebookPixel(id: string) {
  if (document.querySelector(`script[data-analytics="fbpixel"]`)) return
  const win = window as any
  win.fbq = function fbq(...args: unknown[]) {
    win.fbq.callMethod
      ? win.fbq.callMethod(...args)
      : win.fbq.queue.push(args)
  }
  if (!win.fbq) win.fbq = (...args: unknown[]) => win.fbq(...args)
  win.fbq.push = win.fbq
  win.fbq.loaded = true
  win.fbq.version = '2.0'
  win.fbq.queue = []

  const script = document.createElement('script')
  script.src = 'https://connect.facebook.net/en_US/fbevents.js'
  script.async = true
  script.setAttribute('data-analytics', 'fbpixel')
  document.head.appendChild(script)

  win.fbq('init', id)
  win.fbq('track', 'PageView')
}

function loadGoogleAds(id: string, label?: string) {
  if (document.querySelector(`script[data-analytics="gads"]`)) return
  const url = `https://www.googletagmanager.com/gtag/js?id=${id}`
  const script = document.createElement('script')
  script.src = url
  script.async = true
  script.setAttribute('data-analytics', 'gads')
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  const origGtag = window.gtag
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args)
  }
  window.gtag('js', new Date())
  window.gtag('config', id, { send_page_view: false })
  if (origGtag) window.gtag = origGtag
}
