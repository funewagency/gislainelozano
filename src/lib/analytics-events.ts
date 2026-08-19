'use client'

declare global {
  interface Window {
    __ANALYTICS_CONFIG__?: {
      ga4Id?: string | null
      fbPixelId?: string | null
      gAdsId?: string | null
      gAdsLabel?: string | null
    }
    gtag?: (...args: unknown[]) => void
    fbq?: {
      (...args: unknown[]): void
      callMethod?: (...args: unknown[]) => void
      queue: unknown[]
      loaded: boolean
      version: string
    }
    dataLayer?: unknown[]
  }
}

function getConfig() {
  if (typeof window === 'undefined') return null
  try {
    const el = document.getElementById('analytics-config')
    if (!el?.textContent) return null
    return JSON.parse(el.textContent) as NonNullable<Window['__ANALYTICS_CONFIG__']>
  } catch {
    return null
  }
}

const eventToGA4: Record<string, string> = {
  whatsapp_click: 'whatsapp_click',
  contact_form_started: 'form_start',
  contact_form_submitted: 'form_submit',
  contact_form_error: 'form_error',
  contact_form_success: 'form_success',
  scroll_depth: 'scroll',
  section_viewed: 'section_view',
  service_interest: 'service_interest',
  faq_toggled: 'faq_interaction',
}

const eventToFB: Record<string, string> = {
  whatsapp_click: 'Contact',
  contact_form_started: 'Lead',
  contact_form_submitted: 'Lead',
  contact_form_error: 'Lead',
  contact_form_success: 'CompleteRegistration',
  section_viewed: 'ViewContent',
  service_interest: 'ViewContent',
}

export function trackAll(eventName: string, properties?: Record<string, unknown>) {
  const config = getConfig()
  if (!config) return

  const win = window as Window

  if (config.ga4Id && typeof win.gtag === 'function') {
    if (eventName === 'page_view') return
    const ga4Event = eventToGA4[eventName] || eventName
    win.gtag('event', ga4Event, properties ?? {})
  }

  if (config.fbPixelId && typeof win.fbq === 'function') {
    const fbEvent = eventToFB[eventName]
    if (fbEvent) {
      win.fbq('track', fbEvent, properties ?? {})
    }
  }

  if (config.gAdsId && typeof win.gtag === 'function') {
    if (eventName === 'whatsapp_click' || eventName === 'contact_form_submitted') {
      win.gtag('event', 'conversion', {
        send_to: `${config.gAdsId}${config.gAdsLabel ? '/' + config.gAdsLabel : ''}`,
        ...properties,
      })
    }
  }
}
