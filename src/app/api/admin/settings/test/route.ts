import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { unauthorized, badRequest, serverError, rateLimited } from '@/lib/api-utils';
import { mutationLimiter, shouldRateLimit } from '@/lib/rate-limit';

const GA4_REGEX = /^G-[A-Z0-9]{8,}$/i;
const FB_PIXEL_REGEX = /^\d{13,20}$/;
const GADS_ID_REGEX = /^AW-\d{7,12}$/i;

interface TestPayload {
  service: 'ga4' | 'facebook' | 'google-ads';
  id: string;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  if (shouldRateLimit()) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { allowed } = mutationLimiter.check(`settings-test:${ip}`);
    if (!allowed) return rateLimited(30);
  }

  try {
    const body: TestPayload = await request.json();
    const { service, id } = body;

    if (!id || !id.trim()) {
      return NextResponse.json({ ok: false, error: 'ID não informado' });
    }

    if (id.trim().length > 100) {
      return NextResponse.json({ ok: false, error: 'ID muito longo' });
    }

    const trimmed = id.trim();
    let valid = false;
    let message = '';

    switch (service) {
      case 'ga4':
        valid = GA4_REGEX.test(trimmed);
        message = valid ? 'ID do GA4 válido' : 'Formato inválido. Use G-XXXXXXXX (ex: G-MEASUREMENT123)';
        break;
      case 'facebook':
        valid = FB_PIXEL_REGEX.test(trimmed);
        message = valid ? 'ID do Pixel válido' : 'Formato inválido. O Pixel ID deve conter apenas números (13-20 dígitos)';
        break;
      case 'google-ads':
        valid = GADS_ID_REGEX.test(trimmed);
        message = valid ? 'ID do Google Ads válido' : 'Formato inválido. Use AW-XXXXXXXX (ex: AW-1234567890)';
        break;
      default:
        return NextResponse.json({ ok: false, error: 'Serviço inválido' });
    }

    return NextResponse.json({ ok: valid, message });
  } catch (error) {
    console.error('Test validation error:', error);
    return NextResponse.json({ ok: false, error: 'Erro ao validar' }, { status: 500 });
  }
}
