// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockCapture = vi.fn()
const mockTrackAll = vi.fn()

vi.mock('posthog-js', () => ({
  default: {
    capture: (...args: unknown[]) => mockCapture(...args),
  },
}))

vi.mock('./analytics-events', () => ({
  trackAll: (...args: unknown[]) => mockTrackAll(...args),
}))

import { track, trackSectionView, trackWhatsAppClick } from './analytics'

describe('analytics tracking', () => {
  beforeEach(() => {
    mockCapture.mockReset()
    mockTrackAll.mockReset()
    sessionStorage.clear()
  })

  it('track calls posthog.capture', () => {
    track('whatsapp_click', { position: 'fab' })
    expect(mockCapture).toHaveBeenCalledWith('whatsapp_click', { position: 'fab' })
  })

  it('track also calls trackAll', () => {
    track('whatsapp_click', { position: 'fab' })
    expect(mockTrackAll).toHaveBeenCalledWith('whatsapp_click', { position: 'fab' })
  })

  it('track works with minimal event', () => {
    track('lgpd_consent_given', {})
    expect(mockCapture).toHaveBeenCalledWith('lgpd_consent_given', {})
  })

  it('trackWhatsAppClick fires correct event', () => {
    trackWhatsAppClick('hero')
    expect(mockCapture).toHaveBeenCalledWith('whatsapp_click', { position: 'hero' })
  })

  it('trackSectionView fires on first view only', () => {
    trackSectionView('hero')
    expect(mockCapture).toHaveBeenCalledWith('section_viewed', { section: 'hero' })
    mockCapture.mockReset()
    trackSectionView('hero')
    expect(mockCapture).not.toHaveBeenCalled()
  })

  it('trackSectionView fires for different sections', () => {
    trackSectionView('hero')
    trackSectionView('services')
    expect(mockCapture).toHaveBeenCalledTimes(2)
  })
})
