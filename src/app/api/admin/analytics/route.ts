import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPostHogAnalytics, isPostHogConfigured } from '@/lib/posthog-api';
import { unauthorized, serverError, rateLimited } from '@/lib/api-utils';
import { readLimiter, shouldRateLimit } from '@/lib/rate-limit';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return unauthorized();

    if (shouldRateLimit()) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      const { allowed } = readLimiter.check(`analytics:${ip}`);
      if (!allowed) return rateLimited(30);
    }

    if (!isPostHogConfigured()) {
      return NextResponse.json({
        configured: false,
        message: 'POSTHOG_API_KEY não configurada. Adicione ao .env para ver analytics do PostHog.',
        pageViews: { total: 0, trend: [] },
        uniqueVisitors: 0,
        topSources: [],
        topPages: [],
        recentEvents: [],
        conversionFunnel: [],
      });
    }

    const analytics = await getPostHogAnalytics(30);

    return NextResponse.json({
      configured: true,
      ...analytics,
    });
  } catch (error) {
    return serverError(error, 'Falha ao carregar analytics');
  }
}
