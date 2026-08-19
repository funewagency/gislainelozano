import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { unauthorized, serverError, badRequest, rateLimited } from '@/lib/api-utils';
import { mutationLimiter, readLimiter, shouldRateLimit } from '@/lib/rate-limit';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return unauthorized();

    if (shouldRateLimit()) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      const { allowed } = readLimiter.check(`settings:${ip}`);
      if (!allowed) return rateLimited(30);
    }

    const settings = await db.analyticsSetting.findUnique({ where: { id: 'default' } });
    const config = {
      ga4Id: settings?.ga4Id ?? '',
      fbPixelId: settings?.fbPixelId ?? '',
      gAdsId: settings?.gAdsId ?? '',
      gAdsLabel: settings?.gAdsLabel ?? '',
    };

    return NextResponse.json({
      ...config,
      configured: {
        ga4: !!settings?.ga4Id,
        fb: !!settings?.fbPixelId,
        gAds: !!settings?.gAdsId,
      },
    });
  } catch (error) {
    return serverError(error, 'Falha ao carregar configurações');
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return unauthorized();

    if (shouldRateLimit()) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      const { allowed } = mutationLimiter.check(`settings:${ip}`);
      if (!allowed) return rateLimited(30);
    }

    const body = await request.json();
    const { ga4Id, fbPixelId, gAdsId, gAdsLabel } = body;

    if (ga4Id && typeof ga4Id !== 'string') return badRequest('GA4 ID inválido');
    if (fbPixelId && typeof fbPixelId !== 'string') return badRequest('Facebook Pixel ID inválido');
    if (gAdsId && typeof gAdsId !== 'string') return badRequest('Google Ads ID inválido');

    const settings = await db.analyticsSetting.upsert({
      where: { id: 'default' },
      update: {
        ga4Id: ga4Id?.trim() || null,
        fbPixelId: fbPixelId?.trim() || null,
        gAdsId: gAdsId?.trim() || null,
        gAdsLabel: gAdsLabel?.trim() || null,
      },
      create: {
        id: 'default',
        ga4Id: ga4Id?.trim() || null,
        fbPixelId: fbPixelId?.trim() || null,
        gAdsId: gAdsId?.trim() || null,
        gAdsLabel: gAdsLabel?.trim() || null,
      },
    });

    return NextResponse.json({
      ga4Id: settings.ga4Id ?? '',
      fbPixelId: settings.fbPixelId ?? '',
      gAdsId: settings.gAdsId ?? '',
      gAdsLabel: settings.gAdsLabel ?? '',
      configured: {
        ga4: !!settings.ga4Id,
        fb: !!settings.fbPixelId,
        gAds: !!settings.gAdsId,
      },
    });
  } catch (error) {
    return serverError(error, 'Erro ao salvar configurações');
  }
}
