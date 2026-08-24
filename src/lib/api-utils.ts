import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { authOptions } from './auth';

export function unauthorized() {
  return NextResponse.json(
    { error: 'Não autorizado', code: 'UNAUTHORIZED' },
    { status: 401 },
  );
}

export function notFound(message = 'Recurso não encontrado') {
  return NextResponse.json(
    { error: message, code: 'NOT_FOUND' },
    { status: 404 },
  );
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json(
    { error: message, code: 'BAD_REQUEST', details },
    { status: 400 },
  );
}

export function rateLimited(retryAfterSeconds: number) {
  return NextResponse.json(
    {
      error: 'Muitas requisições. Aguarde um momento.',
      code: 'RATE_LIMITED',
      retryAfter: retryAfterSeconds,
    },
    {
      status: 429,
      headers: { 'Retry-After': String(retryAfterSeconds) },
    },
  );
}

export function serverError(error: unknown, message = 'Erro interno do servidor') {
  console.error('[API Error]', error);
  return NextResponse.json(
    { error: message, code: 'SERVER_ERROR' },
    { status: 500 },
  );
}

export async function requireAuth(req?: Request | NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      return session;
    }
  } catch {
    // fallback to token extraction
  }

  if (req) {
    try {
      const secret = process.env.NEXTAUTH_SECRET || 'gislaine-lozano-dev-secret-key-32chars';
      let token = await getToken({ req: req as any, secret });
      if (!token) token = await getToken({ req: req as any, secret, secureCookie: false });
      if (!token) token = await getToken({ req: req as any, secret, secureCookie: true });

      if (token) {
        return {
          user: {
            name: (token.name as string) || 'gislaine',
            email: (token.email as string) || 'admin@admin.local',
            role: (token.role as string) || 'admin',
          },
        };
      }
    } catch {
      // ignore
    }
  }

  return null;
}
