import { PostHog } from 'posthog-node'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let serverClient: any = null

export function resetServerPostHog() {
  serverClient = null
}

export function getServerPostHog() {
  if (typeof window !== 'undefined') {
    return null
  }

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

  if (!key || !host) {
    serverClient = null
    return null
  }

  if (!serverClient) {
    try {
      serverClient = new PostHog(key, { host, flushAt: 1, flushInterval: 0 })
      serverClient.enable()
    } catch (e) {
      console.warn('PostHog server initialization skipped:', e)
      return null
    }
  }

  return serverClient
}

export async function trackServerSide(
  eventName: string,
  properties?: Record<string, unknown>,
  distinctId = 'anonymous'
) {
  const client = getServerPostHog()

  if (!client) {
    console.warn('PostHog server client not available')
    return null
  }

  try {
    const res = client.capture({
      distinctId,
      event: eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
      },
    })
    if (res && typeof res.then === 'function') {
      await res
    }
    return true
  } catch (error) {
    console.error('PostHog server tracking error:', error)
    return false
  }
}
