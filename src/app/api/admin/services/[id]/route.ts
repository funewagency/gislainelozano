import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { unauthorized, serverError, badRequest, rateLimited, requireAuth, notFound } from '@/lib/api-utils';
import { mutationLimiter, shouldRateLimit } from '@/lib/rate-limit';
import { formatIncludes, syncServicesToCmsState } from '@/lib/services-sync';

function getIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

// ── PUT /api/admin/services/[id] ──────────────────────────────────────────

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(request);
    if (!session) return unauthorized();

    if (shouldRateLimit()) {
      const { allowed } = mutationLimiter.check(`services:${getIp(request)}`);
      if (!allowed) return rateLimited(30);
    }

    const { id } = await params;
    const existing = await db.service.findUnique({ where: { id } });
    if (!existing) return notFound('Serviço não encontrado');

    const body = await request.json();
    const { title, subtitle, description, ctaText, ctaLink, includes, isActive } = body;

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0)
        return badRequest('Título inválido');
      if (title.trim().length > 200)
        return badRequest('Título deve ter no máximo 200 caracteres');
    }
    if (description !== undefined) {
      if (typeof description !== 'string' || description.trim().length === 0)
        return badRequest('Descrição inválida');
      if (description.trim().length > 5000)
        return badRequest('Descrição deve ter no máximo 5000 caracteres');
    }
    if (ctaText !== undefined) {
      if (typeof ctaText !== 'string' || ctaText.trim().length === 0)
        return badRequest('Texto do botão inválido');
      if (ctaText.trim().length > 200)
        return badRequest('Texto do botão deve ter no máximo 200 caracteres');
    }

    const updated = await db.service.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(subtitle !== undefined && { subtitle: subtitle?.trim() || null }),
        ...(description !== undefined && { description: description.trim() }),
        ...(ctaText !== undefined && { ctaText: ctaText.trim() }),
        ...(ctaLink !== undefined && { ctaLink: ctaLink?.trim() || null }),
        ...(includes !== undefined && { includes: formatIncludes(includes) }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    await syncServicesToCmsState();

    return NextResponse.json({ service: updated });
  } catch (error) {
    return serverError(error, 'Erro ao atualizar serviço');
  }
}

// ── DELETE /api/admin/services/[id] ──────────────────────────────────────

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(request);
    if (!session) return unauthorized();

    if (shouldRateLimit()) {
      const { allowed } = mutationLimiter.check(`services:${getIp(request)}`);
      if (!allowed) return rateLimited(30);
    }

    const { id } = await params;
    const existing = await db.service.findUnique({ where: { id } });
    if (!existing) return notFound('Serviço não encontrado');

    await db.service.delete({ where: { id } });

    await syncServicesToCmsState();

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error, 'Erro ao excluir serviço');
  }
}

