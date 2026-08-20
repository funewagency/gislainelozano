import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const isApiRoute = req.nextUrl.pathname.startsWith('/api/');
    if (isApiRoute && !req.nextauth.token) {
      return NextResponse.json(
        { error: 'Não autorizado', code: 'UNAUTHORIZED' },
        {
          status: 401,
          headers: { 'WWW-Authenticate': 'Bearer error="invalid_token"' },
        },
      );
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Rotas públicas do admin como a tela de login não exigem token
        if (req.nextUrl.pathname === '/admin/login') {
          return true;
        }
        return !!token;
      },
    },
    pages: {
      signIn: '/admin/login',
    },
  },
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/generate-images',
  ],
};
