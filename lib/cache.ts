/**
 * cache.ts — localStorage cache with TTL (time-to-live).
 *
 * Usage:
 *   import { cacheGet, cacheSet, cacheClear } from '@/lib/cache'
 *   cacheSet('submissions', data, 5 * 60 * 1000) // 5 min TTL
 *   const data = cacheGet('submissions') // null if expired
 */

const PREFIX = 'iu_cache_'

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

/** Get cached data. Returns null if expired or not found. */
export function cacheGet<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry<T>
    if (Date.now() > entry.expiresAt) {
      localStorage.removeItem(PREFIX + key)
      return null
    }
    return entry.data
  } catch {
    return null
  }
}

/** Set cache with TTL in milliseconds. Default: 5 minutes. */
export function cacheSet<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
  if (typeof window === 'undefined') return
  try {
    const entry: CacheEntry<T> = { data, expiresAt: Date.now() + ttlMs }
    localStorage.setItem(PREFIX + key, JSON.stringify(entry))
  } catch {
    // localStorage full or unavailable
  }
}

/** Clear a specific cache key. */
export function cacheClear(key: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(PREFIX + key)
}

/** Clear all expired cache entries. */
export function cacheCleanup(): void {
  if (typeof window === 'undefined') return
  const now = Date.now()
  const toRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (!k?.startsWith(PREFIX)) continue
    try {
      const entry = JSON.parse(localStorage.getItem(k)!) as CacheEntry<unknown>
      if (now > entry.expiresAt) toRemove.push(k)
    } catch {
      toRemove.push(k!)
    }
  }
  toRemove.forEach((k) => localStorage.removeItem(k))
}
