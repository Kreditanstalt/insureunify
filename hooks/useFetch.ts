'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { cacheGet, cacheSet } from '@/lib/cache'

interface UseFetchOptions {
  /** Cache TTL in ms. Default 5 min. Set 0 to disable cache. */
  cacheTtl?: number
  /** Skip fetch (e.g., wait for auth). */
  skip?: boolean
}

interface UseFetchResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Simple SWR-like fetch hook with localStorage cache.
 * - Shows cached data immediately (stale)
 * - Fetches fresh data in background (revalidate)
 * - Deduplicates simultaneous calls
 */
export function useFetch<T>(
  url: string | null,
  transform?: (json: unknown) => T,
  options: UseFetchOptions = {},
): UseFetchResult<T> {
  const { cacheTtl = 5 * 60 * 1000, skip = false } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const urlRef = useRef(url)
  urlRef.current = url

  const fetchData = useCallback(async () => {
    if (!urlRef.current || skip) {
      setLoading(false)
      return
    }

    const cacheKey = urlRef.current.replace(/[^a-zA-Z0-9]/g, '_')

    // Show cached data immediately
    if (cacheTtl > 0) {
      const cached = cacheGet<T>(cacheKey)
      if (cached) {
        setData(cached)
        setLoading(false)
      }
    }

    // Fetch fresh in background
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch(urlRef.current, { signal: controller.signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const result = transform ? transform(json) : json as T
      setData(result)
      setError(null)
      if (cacheTtl > 0 && result != null) {
        cacheSet(cacheKey, result, cacheTtl)
      }
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
      setError((e as Error).message)
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }, [skip, cacheTtl, transform])

  useEffect(() => {
    fetchData()
    return () => abortRef.current?.abort()
  }, [fetchData, url])

  return { data, loading, error, refetch: fetchData }
}
