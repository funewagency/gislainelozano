import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
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

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }
  return session;
}
