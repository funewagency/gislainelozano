import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { unauthorized, serverError, badRequest, rateLimited, requireAuth } from '@/lib/api-utils';
import { mutationLimiter, readLimiter, shouldRateLimit } from '@/lib/rate-limit';
import { formatIncludes, syncServicesToCmsState } from '@/lib/services-sync';

// ── Helpers ──────────────────────────────────────────────────────────────

function getIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

// ── GET /api/admin/services ───────────────────────────────────────────────

export async function GET(request: Request) {
  try {
    const session = await requireAuth(request);
    if (!session) return unauthorized();

    if (shouldRateLimit()) {
      const { allowed } = readLimiter.check(`services:${getIp(request)}`);
      if (!allowed) return rateLimited(30);
    }

    const services = await db.service.findMany({
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ services });
  } catch (error) {
    return serverError(error, 'Falha ao carregar serviços');
  }
}

// ── POST /api/admin/services ──────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    if (!session) return unauthorized();

    if (shouldRateLimit()) {
      const { allowed } = mutationLimiter.check(`services:${getIp(request)}`);
      if (!allowed) return rateLimited(30);
    }

    const body = await request.json();
    const { title, subtitle, description, ctaText, ctaLink, includes, isActive } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0)
      return badRequest('Título é obrigatório');
    if (title.trim().length > 200)
      return badRequest('Título deve ter no máximo 200 caracteres');
    if (!description || typeof description !== 'string' || description.trim().length === 0)
      return badRequest('Descrição é obrigatória');
    if (description.trim().length > 5000)
      return badRequest('Descrição deve ter no máximo 5000 caracteres');
    if (!ctaText || typeof ctaText !== 'string' || ctaText.trim().length === 0)
      return badRequest('Texto do botão é obrigatório');
    if (ctaText.trim().length > 200)
      return badRequest('Texto do botão deve ter no máximo 200 caracteres');

    // Set order to the end of the list (appended below)
    const maxOrder = await db.service.aggregate({ _max: { order: true } });
    const nextOrder = (maxOrder._max.order ?? -1) + 1;

    const formattedIncludes = formatIncludes(includes);

    const service = await db.service.create({
      data: {
        title: title.trim(),
        subtitle: subtitle?.trim() || null,
        description: description.trim(),
        ctaText: ctaText.trim(),
        ctaLink: ctaLink?.trim() || null,
        includes: formattedIncludes,
        isActive: isActive !== false,
        order: nextOrder,
      },
    });

    await syncServicesToCmsState();

    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    return serverError(error, 'Erro ao criar serviço');
  }
}
