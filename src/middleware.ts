import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Rota de login (pública)
  if (pathname === '/admin/login') {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
    // Se o usuário já tiver sessão ativa, encaminha direto para o dashboard
    if (token) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // 2. Rotas protegidas (/admin/* e /api/admin/*)
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

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

