'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

type CacheEntry<T> = { data: T; timestamp: number };

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL = 30_000;

export function useAdminFetch<T = unknown>(
  url: string | null,
  options?: {
    cache?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  },
) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: !!url,
    error: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const execute = useCallback(async (overrideUrl?: string) => {
    const targetUrl = overrideUrl ?? url;
    if (!targetUrl) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const cached = options?.cache !== false
      ? cache.get(targetUrl) as CacheEntry<T> | undefined
      : undefined;

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setState({ data: cached.data, loading: false, error: null });
      options?.onSuccess?.(cached.data);
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const res = await fetch(targetUrl, { signal: controller.signal });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const errorMessage = body.error || `Erro ${res.status}`;
        throw new Error(errorMessage);
      }

      const data = await res.json() as T;

      if (options?.cache !== false) {
        cache.set(targetUrl, { data: data as unknown as CacheEntry<unknown>['data'], timestamp: Date.now() });
      }

      setState({ data, loading: false, error: null });
      options?.onSuccess?.(data);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      const message = (err as Error).message || 'Erro ao carregar dados';
      setState((s) => ({ ...s, loading: false, error: message }));
      options?.onError?.(message);
    }
  }, [url, options?.cache, options?.onSuccess, options?.onError]);

  useEffect(() => {
    if (url) execute();
    return () => { abortRef.current?.abort(); };
  }, [url, execute]);

  return { ...state, refetch: execute, loading: state.loading, error: state.error };
}
