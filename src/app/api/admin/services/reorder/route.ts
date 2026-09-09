import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { unauthorized, serverError, badRequest, rateLimited, requireAuth } from '@/lib/api-utils';
import { mutationLimiter, shouldRateLimit } from '@/lib/rate-limit';
import { syncServicesToCmsState } from '@/lib/services-sync';

function getIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

// ── PUT /api/admin/services/reorder ──────────────────────────────────────
// Body: { ids: string[] }  — ordered list of service IDs

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    if (!session) return unauthorized();

    if (shouldRateLimit()) {
      const { allowed } = mutationLimiter.check(`services:reorder:${getIp(request)}`);
      if (!allowed) return rateLimited(30);
    }

    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.some((id) => typeof id !== 'string')) {
      return badRequest('IDs inválidos');
    }

    // Update order for each service in a transaction
    await db.$transaction(
      ids.map((id, index) =>
        db.service.update({ where: { id }, data: { order: index } })
      )
    );

    await syncServicesToCmsState();

    const services = await db.service.findMany({ orderBy: { order: 'asc' } });
    return NextResponse.json({ services });
  } catch (error) {
    return serverError(error, 'Erro ao reordenar serviços');
  }
}

