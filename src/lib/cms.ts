import * as fs from 'fs'

const CMS_BASE = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3001'
const TENANT_SLUG = process.env.NEXT_PUBLIC_TENANT_SLUG || 'gislaine'
const CACHE_TTL = 30_000
const MAX_RETRIES = 3
const CACHE_FILE = '/tmp/gislaine-cms-cache.json'

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const cache = new Map<string, CacheEntry<unknown>>()

function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() })
}

function getPersistedCache<T>(key: string): T | null {
  try {
    const raw = fs.readFileSync(CACHE_FILE, 'utf-8')
    const all = JSON.parse(raw)
    const entry = all[key] as CacheEntry<T> | undefined
    if (!entry) return null
    if (Date.now() - entry.timestamp > CACHE_TTL * 6) {
      delete all[key]
      fs.writeFileSync(CACHE_FILE, JSON.stringify(all))
      return null
    }
    return entry.data
  } catch {
    return null
  }
}

function setPersistedCache<T>(key: string, data: T): void {
  try {
    let all: Record<string, CacheEntry<unknown>> = {}
    try {
      const raw = fs.readFileSync(CACHE_FILE, 'utf-8')
      all = JSON.parse(raw)
    } catch {
      // file doesn't exist yet
    }
    all[key] = { data, timestamp: Date.now() }
    fs.writeFileSync(CACHE_FILE, JSON.stringify(all))
  } catch {
    // write failed
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export interface CmsSection {
  id: string
  type: string
  title: string | null
  config: Record<string, any>
  sortOrder: number
  published: boolean
  contentBlocks: any[]
}

export interface CmsService {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  price: string | null
  features: any
  ctaUrl: string | null
  ctaText: string | null
  sortOrder: number
  published: boolean
}

export interface CmsTestimonial {
  id: string
  name: string
  company: string | null
  role: string | null
  text: string
  rating: number
  avatarUrl: string | null
}

export interface CmsFaq {
  id: string
  question: string
  answer: string
  sortOrder: number
}

export interface CmsConfig {
  tenant: { name: string; slug: string; siteType: string }
  config: Record<string, any>
}

async function cmsFetch<T>(endpoint: string, cacheKey: string): Promise<T> {
  const cached = getCached<T>(cacheKey)
  if (cached) return cached

  let lastErr: unknown
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = 200 * Math.pow(2, attempt - 1)
      console.warn(`[CMS] Retry ${attempt + 1}/${MAX_RETRIES} for ${endpoint} in ${delay}ms`)
      await sleep(delay)
    }

    try {
      const res = await fetch(`${CMS_BASE}/api/v1/${TENANT_SLUG}${endpoint}`, {
        next: { revalidate: 60 },
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) {
        console.warn(`[CMS] ${endpoint} returned ${res.status}`)
        throw new Error(`CMS ${res.status}`)
      }

      const json = await res.json()
      const data = json.data as T
      setCache(cacheKey, data)
      setPersistedCache(cacheKey, data)
      return data
    } catch (err) {
      lastErr = err
      console.warn(`[CMS] Attempt ${attempt + 1}/${MAX_RETRIES} failed for ${endpoint}:`, err)
    }
  }

  const persisted = getPersistedCache<T>(cacheKey)
  if (persisted) {
    console.warn(`[CMS] All retries exhausted, serving persisted cache for ${cacheKey}`)
    setCache(cacheKey, persisted)
    return persisted
  }

  throw lastErr
}

export async function getSiteConfig(): Promise<CmsConfig> {
  return cmsFetch<CmsConfig>('/config', `config:${TENANT_SLUG}`)
}

export async function getSections(type?: string): Promise<CmsSection[]> {
  const query = type ? `?type=${type}` : ''
  return cmsFetch<CmsSection[]>(`/sections${query}`, `sections:${TENANT_SLUG}:${type ?? 'all'}`)
}

export async function getServices(): Promise<CmsService[]> {
  return cmsFetch<CmsService[]>('/services', `services:${TENANT_SLUG}`)
}

export async function getTestimonials(): Promise<CmsTestimonial[]> {
  return cmsFetch<CmsTestimonial[]>('/testimonials', `testimonials:${TENANT_SLUG}`)
}

export async function getFaqs(): Promise<CmsFaq[]> {
  return cmsFetch<CmsFaq[]>('/faq', `faq:${TENANT_SLUG}`)
}

export async function submitLead(data: {
  name: string
  email: string
  phone: string
  message?: string
  source?: string
}): Promise<boolean> {
  try {
    const res = await fetch(`${CMS_BASE}/api/v1/${TENANT_SLUG}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.ok
  } catch (err) {
    console.warn('[CMS] Failed to submit lead:', err)
    return false
  }
}

export function clearCache(): void {
  cache.clear()
}
