// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest'
import { validateEnv, checkEnv } from '@/lib/env'

beforeEach(() => {
  process.env.DATABASE_URL = 'file:./test.db'
  process.env.WEBHOOK_SECRET = 'test-secret'
})

afterEach(() => {
  delete process.env.DATABASE_URL
  delete process.env.WEBHOOK_SECRET
})

describe('validateEnv', () => {
  it('returns empty array when all required vars are present', () => {
    process.env.DATABASE_URL = 'file:./test.db'
    process.env.WEBHOOK_SECRET = 'test-secret'
    expect(validateEnv()).toEqual([])
  })

  it('reports missing DATABASE_URL', () => {
    delete process.env.DATABASE_URL
    process.env.WEBHOOK_SECRET = 'test-secret'
    const issues = validateEnv()
    expect(issues).toHaveLength(1)
    expect(issues[0]).toContain('DATABASE_URL')
  })

  it('reports missing WEBHOOK_SECRET', () => {
    process.env.DATABASE_URL = 'file:./test.db'
    delete process.env.WEBHOOK_SECRET
    const issues = validateEnv()
    expect(issues).toHaveLength(1)
    expect(issues[0]).toContain('WEBHOOK_SECRET')
  })

  it('reports both missing when neither is set', () => {
    delete process.env.DATABASE_URL
    delete process.env.WEBHOOK_SECRET
    const issues = validateEnv()
    expect(issues).toHaveLength(2)
    expect(issues.some((i) => i.includes('DATABASE_URL'))).toBe(true)
    expect(issues.some((i) => i.includes('WEBHOOK_SECRET'))).toBe(true)
  })

  it('returns issues with descriptive messages', () => {
    delete process.env.DATABASE_URL
    delete process.env.WEBHOOK_SECRET
    const issues = validateEnv()
    expect(issues[0]).toMatch(/DATABASE_URL.*required.*missing/)
    expect(issues[1]).toMatch(/WEBHOOK_SECRET.*required.*missing/)
  })
})

describe('checkEnv', () => {
  it('returns true when all required vars are present', () => {
    process.env.DATABASE_URL = 'file:./test.db'
    process.env.WEBHOOK_SECRET = 'test-secret'
    expect(checkEnv()).toBe(true)
  })

  it('returns false when DATABASE_URL is missing', () => {
    delete process.env.DATABASE_URL
    process.env.WEBHOOK_SECRET = 'test-secret'
    expect(checkEnv()).toBe(false)
  })

  it('returns false when WEBHOOK_SECRET is missing', () => {
    process.env.DATABASE_URL = 'file:./test.db'
    delete process.env.WEBHOOK_SECRET
    expect(checkEnv()).toBe(false)
  })

  it('returns false when both are missing', () => {
    delete process.env.DATABASE_URL
    delete process.env.WEBHOOK_SECRET
    expect(checkEnv()).toBe(false)
  })
})
