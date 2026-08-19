// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useIsMobile } from './use-mobile'

describe('useIsMobile', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('returns true on small viewports', () => {
    Object.defineProperty(window, 'innerWidth', { value: 500, writable: true })
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('returns false on large viewports', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true })
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('returns true at 767px', () => {
    Object.defineProperty(window, 'innerWidth', { value: 767, writable: true })
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('returns false at 768px', () => {
    Object.defineProperty(window, 'innerWidth', { value: 768, writable: true })
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })
})
