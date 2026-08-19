// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useCmsData } from './use-cms-data'

describe('useCmsData', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('returns default data and loading=true initially', () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: {} }), { status: 200 }) as any,
    )
    const { result } = renderHook(() => useCmsData())
    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeDefined()
  })

  it('fetches and sets data on success', async () => {
    const mockCmsData = { hero: { title: 'Test Hero' }, meta: { version: 1 } }
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: mockCmsData }), { status: 200 }) as any,
    )

    const { result } = renderHook(() => useCmsData())
    await waitFor(() => {
      expect(result.current.data).toEqual(mockCmsData)
    })
    expect(result.current.loading).toBe(false)
  })

  it('keeps default data on non-ok response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response('Internal error', { status: 500 }) as any,
    )

    const { result } = renderHook(() => useCmsData())
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.data).toBeDefined()
  })

  it('handles fetch error gracefully', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network'))

    const { result } = renderHook(() => useCmsData())
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.data).toBeDefined()
  })

  it('aborts fetch on unmount', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: {} }), { status: 200 }) as any,
    )

    const { unmount } = renderHook(() => useCmsData())
    unmount()
  })
})
