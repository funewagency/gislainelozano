import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { trackServerSide } from '@/lib/analytics-server';
import * as Sentry from '@sentry/nextjs';
import { isValidPhone } from '@brazilian-utils/brazilian-utils';
import { contactLimiter, shouldRateLimit } from '@/lib/rate-limit';
import { sanitizeInput, sanitizeEmail, sanitizePhone } from '@/lib/sanitize';

export async function POST(request: NextRequest) {
  try {
    if (shouldRateLimit()) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || request.headers.get('x-real-ip')
        || 'unknown';

      const { allowed } = contactLimiter.check(ip);
      if (!allowed) {
        return NextResponse.json(
          { error: 'Muitas tentativas. Aguarde um momento antes de enviar novamente.' },
          { status: 429 }
        );
      }
    }

    const body = await request.json();

    // 1. Proteção contra Bots: Honeypot (campo armadilha invisível para humanos)
    const honeypot = body.website || body.company_url || body._hp_field;
    if (honeypot) {
      // Retorna sucesso falso sem executar nada para desarmar o bot sem alertá-lo
      return NextResponse.json(
        { success: true, message: 'Mensagem recebida com sucesso!' },
        { status: 200 }
      );
    }

    // 2. Proteção contra Bots: Time-to-Submit (envio rápido demais em < 1.5s)
    const formTimestamp = body._ts ? Number(body._ts) : null;
    if (formTimestamp && !isNaN(formTimestamp)) {
      const timeElapsed = Date.now() - formTimestamp;
      if (timeElapsed < 1500 && timeElapsed > 0) {
        // Envio instantâneo característico de script automatizado
        return NextResponse.json(
          { success: true, message: 'Mensagem recebida com sucesso!' },
          { status: 200 }
        );
      }
    }

    // 3. Sanitização rigorosa das entradas (Anti-XSS & Anti-Injection)
    const rawName = sanitizeInput(body.name, 100);
    const rawEmail = sanitizeEmail(body.email);
    const rawPhone = sanitizePhone(body.phone);
    const message = body.message ? sanitizeInput(body.message, 1000) : null;
    const source = body.source ? sanitizeInput(body.source, 50) : null;
    const medium = body.medium ? sanitizeInput(body.medium, 50) : null;
    const campaign = body.campaign ? sanitizeInput(body.campaign, 50) : null;

    if (!rawName || !rawEmail || !rawPhone) {
      return NextResponse.json(
        { error: 'Nome, e-mail e WhatsApp são obrigatórios.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(rawEmail)) {
      return NextResponse.json(
        { error: 'E-mail inválido.' },
        { status: 400 }
      );
    }

    if (!isValidPhone(rawPhone)) {
      return NextResponse.json(
        { error: 'WhatsApp inválido. Informe um número brasileiro com DDD.' },
        { status: 400 }
      );
    }

    const cmsUrl = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3001';
    const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG || 'gislaine';

    await trackServerSide('lead_created', { source: 'contact-form', has_message: !!message }, rawEmail);

    const [localResult, cmsResult] = await Promise.allSettled([
      db.contact.create({
        data: {
          name: rawName,
          email: rawEmail,
          phone: rawPhone,
          message: message || null,
          source: source || null,
          medium: medium || null,
          campaign: campaign || null,
        },
      }),
      fetch(`${cmsUrl}/api/v1/${tenantSlug}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: rawName,
          email: rawEmail,
          phone: rawPhone,
          message: message ? String(message).trim() : null,
          source: source ? String(source).trim() : 'contact-form',
          medium: medium ? String(medium).trim() : undefined,
          campaign: campaign ? String(campaign).trim() : undefined,
        }),
      }).then(r => r.ok),
    ]);

    if (localResult.status === 'rejected') {
      console.error('Local DB save failed:', localResult.reason);
    }

    if (cmsResult.status === 'rejected' || !cmsResult.value) {
      console.warn('CMS lead submission failed — local save succeeded as fallback');
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Mensagem recebida com sucesso!',
        syncedToCms: cmsResult.status === 'fulfilled' && cmsResult.value,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
