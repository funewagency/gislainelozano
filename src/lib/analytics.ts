'use client'

import posthog from 'posthog-js'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { trackAll } from './analytics-events'

export function useAnalyticsPageView() {
  const pathname = usePathname()

  useEffect(() => {
    posthog.capture('page_view', { path: pathname })
  }, [pathname])

  useEffect(() => {
    const trackScrollDepth = () => {
      const scrollPct = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      )
      const thresholds = [25, 50, 75, 100]
      for (const t of thresholds) {
        if (scrollPct >= t) {
          const key = `scroll-depth-${t}`
          if (!sessionStorage.getItem(key)) {
            sessionStorage.setItem(key, '1')
            track('scroll_depth', { depth_percent: t })
          }
        }
      }
    }
    window.addEventListener('scroll', trackScrollDepth, { passive: true })
    return () => window.removeEventListener('scroll', trackScrollDepth)
  }, [])
}

export type AnalyticsEvent =
  | { name: 'page_view'; properties?: { path: string } }
  | { name: 'section_viewed'; properties: { section: string } }
  | { name: 'whatsapp_click'; properties: { position: 'fab' | 'hero' | 'navbar' | 'contact_section' } }
  | { name: 'contact_form_started'; properties: { source?: string } }
  | { name: 'contact_form_submitted'; properties: { has_message: boolean } }
  | { name: 'contact_form_error'; properties: { error: string; source?: string } }
  | { name: 'contact_form_success'; properties: { syncedToCms?: boolean; source?: string } }
  | { name: 'faq_toggled'; properties: { question: string; action: 'open' | 'close' } }
  | { name: 'service_interest'; properties: { service: string } }
  | { name: 'lgpd_consent_given'; properties: Record<string, never> }
  | { name: 'scroll_depth'; properties: { depth_percent: number } }
  | { name: 'navbar_link_click'; properties: { target: string } }
  | { name: 'testimonial_nav'; properties: { direction: string; index?: number } }
  | { name: 'whatsapp_modal_closed'; properties: { source?: string } }
  | { name: 'admin_login'; properties: { success: boolean } }

export function track(eventName: AnalyticsEvent['name'], properties: AnalyticsEvent['properties']) {
  if (typeof window === 'undefined') return
  posthog.capture(eventName, properties)
  trackAll(eventName, properties)
}

export function trackSectionView(sectionName: string) {
  const viewedSections = sessionStorage.getItem('viewed-sections')?.split(',') || []
  if (viewedSections.includes(sectionName)) return
  sessionStorage.setItem('viewed-sections', [...viewedSections, sectionName].join(','))
  track('section_viewed', { section: sectionName })
}

export function trackWhatsAppClick(position: 'fab' | 'hero' | 'navbar' | 'contact_section') {
  track('whatsapp_click', { position })
}
