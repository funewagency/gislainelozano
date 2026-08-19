import type { Page } from '@playwright/test'

/**
 * Helpers to make CMS e2e tests non-destructive.
 *
 * Tests that exercise the real save flow (PUT /api/admin/cms) must leave the
 * database exactly as they found it. Use `snapshotCmsData(page)` before the
 * mutation and `restoreCmsData(page, snapshot)` in a `finally` block (or
 * `test.afterEach`) to put the original values back.
 *
 * The fetches run inside the page context, so they carry the admin session
 * cookie set by AuthPage.loginAndGoTo().
 */

export interface CmsSnapshot {
  data: any
}

/** Fetch the full CMS config as the logged-in admin session sees it. */
export async function snapshotCmsData(page: Page): Promise<CmsSnapshot> {
  const data = await page.evaluate(async () => {
    const res = await fetch('/api/admin/cms', { cache: 'no-store' })
    if (!res.ok) throw new Error(`GET /api/admin/cms failed: ${res.status}`)
    const json = await res.json()
    return json.data
  })
  return { data }
}

/** PUT a full CMS config back via the admin API (carries session cookie). */
export async function restoreCmsData(page: Page, snapshot: CmsSnapshot): Promise<void> {
  await page.evaluate(async (payload) => {
    const res = await fetch('/api/admin/cms', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`PUT /api/admin/cms failed: ${res.status} ${body.slice(0, 300)}`)
    }
  }, snapshot.data)
}

/** Poll the CMS API until a condition is met (with timeout). */
export async function pollCmsUntil<T>(
  page: Page,
  predicate: (data: any) => T | null,
  { timeout = 10000, interval = 500 } = {}
): Promise<T> {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    const result = await page.evaluate(async () => {
      const res = await fetch('/api/admin/cms', { cache: 'no-store' })
      if (!res.ok) throw new Error(`GET /api/admin/cms failed: ${res.status}`)
      const json = await res.json()
      return json.data
    })
    const match = predicate(result)
    if (match !== null) return match
    await new Promise(r => setTimeout(r, interval))
  }
  throw new Error(`pollCmsUntil timed out after ${timeout}ms`)
}
