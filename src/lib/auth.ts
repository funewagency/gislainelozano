import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function cleanVal(val?: string): string {
  if (!val) return '';
  let str = val.trim();
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    str = str.slice(1, -1).trim();
  }
  return str;
}

function timingSafeEqual(a: string, b: string): boolean {
  const cleanA = cleanVal(a);
  const cleanB = cleanVal(b);
  const bufA = Buffer.from(cleanA, 'utf-8');
  const bufB = Buffer.from(cleanB, 'utf-8');
  
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Usuário', type: 'text' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const adminUser = cleanVal(process.env.ADMIN_USERNAME) || 'gislaine';
        const adminHash = cleanVal(process.env.ADMIN_PASSWORD_HASH);
        const adminPlain = cleanVal(process.env.ADMIN_PASSWORD);

        if (!adminHash && !adminPlain) {
          console.error('[Auth Security] Nem ADMIN_PASSWORD_HASH nem ADMIN_PASSWORD configurados.');
          return null;
        }

        const inputUser = cleanVal(String(credentials.username));
        const inputPass = String(credentials.password).trim();

        if (inputUser.length > 100 || inputPass.length > 200) {
          return null;
        }

        // 1. Valida usuário (case-insensitive)
        const isUserMatch = inputUser.toLowerCase() === adminUser.toLowerCase();
        if (!isUserMatch) {
          return null;
        }

        // 2. Valida contra ADMIN_PASSWORD direto (se definido)
        if (adminPlain && timingSafeEqual(inputPass, adminPlain)) {
          return {
            id: '1',
            name: adminUser,
            email: `${adminUser}@admin.local`,
          };
        }

        // 3. Valida contra ADMIN_PASSWORD_HASH (SHA-256 ou texto plano)
        if (adminHash) {
          const passwordHash = hashPassword(inputPass);
          const isHashMatch = timingSafeEqual(passwordHash, adminHash);
          const isDirectMatch = timingSafeEqual(inputPass, adminHash);

          if (isHashMatch || isDirectMatch) {
            return {
              id: '1',
              name: adminUser,
              email: `${adminUser}@admin.local`,
            };
          }
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' && !process.env.NEXTAUTH_URL?.startsWith('http://localhost')
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production' && !process.env.NEXTAUTH_URL?.startsWith('http://localhost'),
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = 'admin';
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.role = token.role as string;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'gislaine-lozano-dev-secret-key-32chars',
};
