import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const secret = process.env.NEXTAUTH_SECRET || 'gislaine-lozano-dev-secret-key-32chars';

  async function getAuthToken() {
    let token = await getToken({ req, secret });
    if (!token) {
      token = await getToken({ req, secret, secureCookie: false });
    }
    if (!token) {
      token = await getToken({ req, secret, secureCookie: true });
    }
    return token;
  }

  // 1. Rota de login, rotas de autenticação e leitura pública do CMS
  if (
    pathname === '/admin/login' ||
    pathname.startsWith('/api/auth/') ||
    (pathname === '/api/admin/cms' && req.method === 'GET')
  ) {
    return NextResponse.next();
  }

  // 2. Rotas protegidas (/admin/* e /api/admin/*)
  const token = await getAuthToken();

  const isApiRoute = pathname.startsWith('/api/');

  if (!token) {
    if (isApiRoute) {
      return NextResponse.json(
        { error: 'Não autorizado', code: 'UNAUTHORIZED' },
        {
          status: 401,
          headers: { 'WWW-Authenticate': 'Bearer error="invalid_token"' },
        },
      );
    }
    const signInUrl = new URL('/admin/login', req.url);
    signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/generate-images',
  ],
};

