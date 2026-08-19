import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const isApiRoute = req.nextUrl.pathname.startsWith('/api/');
    if (isApiRoute && !req.nextauth.token) {
      return NextResponse.json(
        { error: 'Não autorizado', code: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }
    return NextResponse.next();
  },
  {
    pages: {
      signIn: '/admin/login',
    },
  },
);

export const config = {
  matcher: ['/admin/:path*'],
};
