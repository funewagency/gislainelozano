import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { readLimiter, shouldRateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  if (shouldRateLimit()) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { allowed } = readLimiter.check(`settings-public:${ip}`);
    if (!allowed) {
      return NextResponse.json({ error: 'Muitas requisições' }, { status: 429 });
    }
  }

  try {
    const settings = await db.analyticsSetting.findUnique({ where: { id: 'default' } });
    return NextResponse.json({
      ga4Id: settings?.ga4Id ?? null,
      fbPixelId: settings?.fbPixelId ?? null,
      gAdsId: settings?.gAdsId ?? null,
      gAdsLabel: settings?.gAdsLabel ?? null,
    });
  } catch {
    return NextResponse.json({
      ga4Id: null,
      fbPixelId: null,
      gAdsId: null,
      gAdsLabel: null,
    });
  }
}
