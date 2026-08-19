// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { saveLeadData, getLeadData, clearLeadData } from './use-lead-persistence'

const STORAGE_KEY = 'gislaine_lead_data'

function setupLocalStorageMock() {
  const store: Record<string, string> = {}
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, val: string) => { store[key] = val }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]) }),
    get length() { return Object.keys(store).length },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
  })
}

describe('saveLeadData', () => {
  beforeEach(() => {
    setupLocalStorageMock()
  })

  it('stores data in localStorage with _expires field', () => {
    saveLeadData({ name: 'João', email: 'joao@test.com', phone: '11999999999' })
    const raw = localStorage.getItem(STORAGE_KEY)
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!)
    expect(parsed.name).toBe('João')
    expect(parsed.email).toBe('joao@test.com')
    expect(parsed.phone).toBe('11999999999')
    expect(parsed._expires).toBeGreaterThan(Date.now())
  })

  it('sets expiry 30 days in the future', () => {
    const now = Date.now()
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000
    saveLeadData({ name: 'Test', email: 'test@test.com', phone: '111111' })
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = JSON.parse(raw!)
    expect(parsed._expires).toBeGreaterThanOrEqual(now + thirtyDaysMs - 100)
    expect(parsed._expires).toBeLessThan(now + thirtyDaysMs + 100)
  })

  it('does not throw when localStorage is unavailable', () => {
    vi.stubGlobal('localStorage', undefined)
    expect(() => saveLeadData({ name: 'A', email: 'a@a.com', phone: '1' })).not.toThrow()
  })
})

describe('getLeadData', () => {
  beforeEach(() => {
    setupLocalStorageMock()
  })

  it('returns parsed data when valid entry exists', () => {
    const data = { name: 'Maria', email: 'maria@test.com', phone: '988888888', _expires: Date.now() + 999999 }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    const result = getLeadData()
    expect(result).toEqual({ name: 'Maria', email: 'maria@test.com', phone: '988888888' })
  })

  it('returns empty object when no key exists', () => {
    expect(getLeadData()).toEqual({})
  })

  it('returns empty object for expired data and removes the key', () => {
    const expired = { name: 'Old', email: 'old@test.com', phone: '000', _expires: Date.now() - 1000 }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expired))
    expect(getLeadData()).toEqual({})
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('returns empty object for corrupt JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not-valid-json}')
    expect(getLeadData()).toEqual({})
  })

  it('handles missing _expires field by returning data anyway', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: 'NoExp', email: 'no@exp.com', phone: '123' }))
    const result = getLeadData()
    expect(result).toEqual({ name: 'NoExp', email: 'no@exp.com', phone: '123' })
  })

  it('handles partial data gracefully', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: 'OnlyName', _expires: Date.now() + 99999 }))
    const result = getLeadData()
    expect(result).toEqual({ name: 'OnlyName', email: '', phone: '' })
  })
})

describe('clearLeadData', () => {
  beforeEach(() => {
    setupLocalStorageMock()
  })

  it('removes the lead data key from localStorage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: 'X', email: 'x@x.com', phone: '1' }))
    clearLeadData()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('does not throw when key does not exist', () => {
    expect(() => clearLeadData()).not.toThrow()
  })
})
