import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { unauthorized, serverError, badRequest, rateLimited } from '@/lib/api-utils';
import { mutationLimiter, shouldRateLimit } from '@/lib/rate-limit';

const TENANT = 'gislaine';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return unauthorized();

    if (shouldRateLimit()) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      const { allowed } = mutationLimiter.check(`revisions:${ip}`);
      if (!allowed) return rateLimited(30);
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 200);
    const offset = Number(searchParams.get('offset')) || 0;

    const [revisions, total] = await Promise.all([
      db.cmsRevision.findMany({
        where: { tenant: TENANT },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.cmsRevision.count({ where: { tenant: TENANT } }),
    ]);

    return NextResponse.json({
      revisions: revisions.map((r) => ({
        id: r.id,
        version: r.version,
        summary: r.summary,
        timestamp: r.createdAt,
        createdBy: r.createdBy,
      })),
      total,
      limit,
      offset,
    });
  } catch (error) {
    return serverError(error, 'Falha ao carregar revisões');
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return unauthorized();

    if (shouldRateLimit()) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      const { allowed } = mutationLimiter.check(`revisions:${ip}`);
      if (!allowed) return rateLimited(30);
    }

    const { version } = await request.json();
    if (!version || typeof version !== 'number') {
      return badRequest('Número da versão é obrigatório');
    }

    const revision = await db.cmsRevision.findFirst({
      where: { tenant: TENANT, version },
      orderBy: { createdAt: 'desc' },
    });

    if (!revision) {
      return NextResponse.json({ error: 'Revision not found' }, { status: 404 });
    }

    return NextResponse.json({
      version: revision.version,
      summary: revision.summary,
      timestamp: revision.createdAt,
      createdBy: revision.createdBy,
      data: JSON.parse(revision.data),
    });
  } catch (error) {
    console.error('[Revisions API] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to load revision' },
      { status: 500 },
    );
  }
}
