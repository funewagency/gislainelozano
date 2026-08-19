import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createHmac } from 'crypto'
import { NextRequest } from 'next/server'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

function makeRequest(body: any, signature: string): NextRequest {
  const url = 'http://localhost:3000/api/revalidate'
  return new NextRequest(url, {
    method: 'POST',
    headers: { 'x-webhook-signature': signature, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/revalidate', () => {
  beforeEach(() => {
    vi.resetModules()
    process.env.WEBHOOK_SECRET = 'test-webhook-secret'
  })

  it('returns 401 when signature is missing', async () => {
    const { POST } = await import('@/app/api/revalidate/route')
    const req = new NextRequest('http://localhost:3000/api/revalidate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ event: 'publish' }),
    })
    const res = await POST(req)
    const json = await res.json()
    expect(res.status).toBe(401)
    expect(json.error).toBe('Missing signature')
  })

  it('returns 401 when signature is invalid', async () => {
    const { POST } = await import('@/app/api/revalidate/route')
    const req = makeRequest({ event: 'publish' }, 'invalid-signature')
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 200 when signature is valid', async () => {
    const { POST } = await import('@/app/api/revalidate/route')
    const sig = createHmac('sha256', 'test-webhook-secret').update(JSON.stringify({ event: 'publish', tenant: 'gislaine' })).digest('hex')
    const req = makeRequest({ event: 'publish', tenant: 'gislaine' }, sig)
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })
})
