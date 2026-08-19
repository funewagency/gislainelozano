import { describe, it, expect } from 'vitest'
import { createHmac } from 'crypto'
import { verifyWebhookSignature } from '@/app/api/revalidate/verify'

describe('verifyWebhookSignature', () => {
  const secret = 'test-secret'
  const payload = '{"event":"publish","tenant":"gislaine"}'

  it('returns true for a valid signature', () => {
    const expected = createHmac('sha256', secret).update(payload).digest('hex')
    expect(verifyWebhookSignature(payload, expected, secret)).toBe(true)
  })

  it('returns false for a tampered payload', () => {
    const validSig = createHmac('sha256', secret).update(payload).digest('hex')
    expect(verifyWebhookSignature(payload + 'tampered', validSig, secret)).toBe(false)
  })

  it('returns false for a wrong secret', () => {
    const sig = createHmac('sha256', 'wrong-secret').update(payload).digest('hex')
    expect(verifyWebhookSignature(payload, sig, secret)).toBe(false)
  })

  it('returns false for empty signature', () => {
    expect(verifyWebhookSignature(payload, '', secret)).toBe(false)
  })

  it('returns false for non-hex signature', () => {
    expect(verifyWebhookSignature(payload, 'not-a-valid-hex-string', secret)).toBe(false)
  })

  it('returns false when signature length differs from expected', () => {
    expect(verifyWebhookSignature(payload, 'a'.repeat(63), secret)).toBe(false)
  })
})
