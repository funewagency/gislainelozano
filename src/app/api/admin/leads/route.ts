import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { unauthorized, serverError, rateLimited, badRequest } from '@/lib/api-utils';
import { readLimiter, mutationLimiter, shouldRateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return unauthorized();

    if (shouldRateLimit()) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      const { allowed } = readLimiter.check(`leads:${ip}`);
      if (!allowed) return rateLimited(30);
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const skip = (page - 1) * limit;
    const search = searchParams.get('search') || '';
    const source = searchParams.get('source') || '';
    const statsOnly = searchParams.get('stats') === 'true';

    if (page > 500) {
      return NextResponse.json(
        { error: 'Página máxima é 500', code: 'BAD_REQUEST' },
        { status: 400 },
      );
    }

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }
    if (source) {
      where.source = source;
    }

    // When only stats are requested (e.g. dashboard), skip the rows fetch entirely.
    let leads: any[] = [];
    const total = await db.contact.count({ where });
    if (!statsOnly) {
      leads = await db.contact.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });
    }

    const sourceStats = await db.contact.groupBy({
      by: ['source'],
      _count: { source: true },
      orderBy: { _count: { source: 'desc' } },
    });

    const leadCount = await db.contact.count();

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total: leadCount,
        bySource: sourceStats.map((s) => ({
          source: s.source || 'direct',
          count: s._count.source,
        })),
      },
    });
  } catch (error) {
    return serverError(error, 'Falha ao carregar leads');
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return unauthorized();

    if (shouldRateLimit()) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      const { allowed } = mutationLimiter.check(`leads:delete:${ip}`);
      if (!allowed) return rateLimited(30);
    }

    // Accept { ids: string[] } in the body, or a single ?id=<id> query param.
    const { searchParams } = new URL(request.url);
    const queryId = searchParams.get('id');

    let ids: string[];
    if (queryId) {
      ids = [queryId];
    } else {
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return badRequest('Corpo JSON inválido. Envie { ids: string[] }.');
      }
      const parsed = (body ?? {}) as { ids?: unknown };
      if (!Array.isArray(parsed.ids) || parsed.ids.length === 0) {
        return badRequest('É necessário informar "ids" (array de strings).');
      }
      ids = parsed.ids.map((v) => String(v)).filter(Boolean);
      if (ids.length === 0) {
        return badRequest('Nenhum id válido informado.');
      }
      if (ids.length > 500) {
        return badRequest('Máximo de 500 leads por operação.');
      }
    }

    const exists = await db.contact.count({ where: { id: { in: ids } } });
    if (exists === 0) {
      return NextResponse.json({ deleted: 0, message: 'Nenhum lead encontrado.' });
    }

    const result = await db.contact.deleteMany({ where: { id: { in: ids } } });

    return NextResponse.json({ deleted: result.count, requested: ids.length });
  } catch (error) {
    return serverError(error, 'Falha ao remover leads');
  }
}
