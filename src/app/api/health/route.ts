import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { checkEnv } from '@/lib/env'
import { readLimiter, shouldRateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  if (shouldRateLimit()) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { allowed } = readLimiter.check(`health:${ip}`);
    if (!allowed) {
      return NextResponse.json({ error: 'Muitas requisições' }, { status: 429 });
    }
  }

  const envOk = checkEnv()

  let dbOk = false
  try {
    await db.$queryRaw`SELECT 1`
    dbOk = true
  } catch {
    // db down
  }

  let cmsOk = false
  try {
    const cmsUrl = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3001'
    const tenant = process.env.NEXT_PUBLIC_TENANT_SLUG || 'gislaine'
    const res = await fetch(`${cmsUrl}/api/v1/${tenant}/config`, {
      signal: AbortSignal.timeout(3000),
    })
    cmsOk = res.ok
  } catch {
    // cms down
  }

  const allOk = envOk && dbOk

  return NextResponse.json(
    {
      ok: allOk,
      env: envOk,
      db: dbOk,
      cms: cmsOk,
      timestamp: new Date().toISOString(),
    },
    { status: allOk ? 200 : 503 }
  )
}
