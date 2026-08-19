// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useAdminFetch } from './use-admin-fetch'

let testId = 0

function nextUrl() {
  testId += 1
  return `/api/test-${testId}`
}

describe('useAdminFetch', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('returns null data and loading=true initially when url provided', async () => {
    const url = nextUrl()
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }) as any,
    )
    const { result } = renderHook(() => useAdminFetch(url, { cache: false }))
    expect(result.current.data).toBeNull()
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()
    await waitFor(() => expect(result.current.loading).toBe(false))
  })

  it('returns null data and loading=false when url is null', () => {
    const { result } = renderHook(() => useAdminFetch(null))
    expect(result.current.data).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('fetches and returns data on success', async () => {
    const url = nextUrl()
    const mockData = { foo: 'bar' }
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockData), { status: 200 }) as any,
    )

    const { result } = renderHook(() => useAdminFetch(url, { cache: false }))
    await waitFor(() => {
      expect(result.current.data).toEqual(mockData)
    })
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('sets error on non-ok response', async () => {
    const url = nextUrl()
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'Not found' }), { status: 404 }) as any,
    )

    const { result } = renderHook(() => useAdminFetch(url, { cache: false }))
    await waitFor(() => {
      expect(result.current.error).toBe('Not found')
    })
    expect(result.current.loading).toBe(false)
  })

  it('uses fallback error message when body has no error field', async () => {
    const url = nextUrl()
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response('Bad text', { status: 500, headers: { 'content-type': 'text/plain' } }) as any,
    )

    const { result } = renderHook(() => useAdminFetch(url, { cache: false }))
    await waitFor(() => {
      expect(result.current.error).toBe('Erro 500')
    })
  })

  it('sets error on network failure', async () => {
    const url = nextUrl()
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network down'))

    const { result } = renderHook(() => useAdminFetch(url, { cache: false }))
    await waitFor(() => {
      expect(result.current.error).toBe('Network down')
    })
  })

  it('caches responses within TTL', async () => {
    const url = nextUrl()
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ v: 1 }), { status: 200 }) as any,
    )

    const { result, rerender } = renderHook(() => useAdminFetch(url))
    await waitFor(() => {
      expect(result.current.data).toEqual({ v: 1 })
    })

    rerender()
    await new Promise((r) => setTimeout(r, 50))
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('bypasses cache when cache: false', async () => {
    const url = nextUrl()
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ v: 1 }), { status: 200 }) as any,
    )

    const { result } = renderHook(() => useAdminFetch(url, { cache: false }))
    await waitFor(() => {
      expect(result.current.data).toEqual({ v: 1 })
    })
    expect(fetchSpy).toHaveBeenCalledTimes(1)

    await act(async () => {
      await result.current.refetch()
    })

    expect(fetchSpy.mock.calls.length).toBeGreaterThan(1)
  })

  it('calls onSuccess callback with data', async () => {
    const url = nextUrl()
    const onSuccess = vi.fn()
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ value: 42 }), { status: 200 }) as any,
    )

    renderHook(() => useAdminFetch(url, { onSuccess, cache: false }))
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({ value: 42 })
    })
  })

  it('calls onError callback on failure', async () => {
    const url = nextUrl()
    const onError = vi.fn()
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'Custom' }), { status: 400 }) as any,
    )

    renderHook(() => useAdminFetch(url, { onError, cache: false }))
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('Custom')
    })
  })

  it('refetch triggers a new request', async () => {
    const url = nextUrl()
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ v: 1 }), { status: 200 }) as any,
    )

    const { result } = renderHook(() => useAdminFetch(url, { cache: false }))
    await waitFor(() => {
      expect(result.current.data).toEqual({ v: 1 })
    })

    await act(async () => {
      await result.current.refetch()
    })

    expect(fetchSpy.mock.calls.length).toBeGreaterThanOrEqual(2)
  })

  it('ignores AbortError on unmount', async () => {
    const url = nextUrl()
    const abortError = new Error('Aborted')
    abortError.name = 'AbortError'
    vi.spyOn(global, 'fetch').mockImplementation(
      () => new Promise((_, reject) => setTimeout(() => reject(abortError), 50)),
    )

    const { unmount } = renderHook(() => useAdminFetch(url, { cache: false }))
    unmount()
    await new Promise((r) => setTimeout(r, 100))
  })
})
