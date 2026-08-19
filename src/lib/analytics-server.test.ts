import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCapture = vi.hoisted(() => vi.fn())
const mockEnable = vi.hoisted(() => vi.fn())

vi.mock('posthog-node', () => {
  function MockPostHog(this: any) {
    this.capture = mockCapture
    this.enable = mockEnable
  }
  return {
    PostHog: MockPostHog,
  }
})

describe('trackServerSide', () => {
  beforeEach(async () => {
    vi.resetModules()
    mockCapture.mockReset()
    mockCapture.mockImplementation(() => Promise.resolve(undefined))
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY
    delete process.env.NEXT_PUBLIC_POSTHOG_HOST
    const { resetServerPostHog } = await import('@/lib/analytics-server')
    resetServerPostHog()
  })

  it('returns null when env vars are missing', async () => {
    const { trackServerSide } = await import('@/lib/analytics-server')
    const result = await trackServerSide('test_event', { key: 'val' })
    expect(result).toBeNull()
  })

  it('returns true on successful capture', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test-key'
    process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://eu.posthog.com'
    const { trackServerSide } = await import('@/lib/analytics-server')
    const result = await trackServerSide('test_event', { key: 'val' })
    expect(result).toBe(true)
  })

  it('returns false on capture failure', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test-key'
    process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://eu.posthog.com'
    mockCapture.mockRejectedValue(new Error('network error'))
    const { trackServerSide } = await import('@/lib/analytics-server')
    const result = await trackServerSide('test_event', {})
    expect(result).toBe(false)
  })
})
