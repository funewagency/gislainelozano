import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');
  
  // Para prevenir timing attack no tamanho do buffer, comparamos com buffer dummy
  if (bufA.length !== bufB.length) {
    const dummy = Buffer.alloc(bufB.length);
    crypto.timingSafeEqual(dummy, bufB);
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

        const adminUser = process.env.ADMIN_USERNAME?.trim();
        const adminHash = process.env.ADMIN_PASSWORD_HASH?.trim();

        if (!adminUser || !adminHash) {
          console.error('[Auth Security] ADMIN_USERNAME ou ADMIN_PASSWORD_HASH não configurados.');
          return null;
        }

        const inputUser = String(credentials.username).trim();
        const inputPass = String(credentials.password);

        if (inputUser.length > 100 || inputPass.length > 200) {
          return null;
        }

        const passwordHash = hashPassword(inputPass);
        const isUserMatch = inputUser.toLowerCase() === adminUser.toLowerCase();
        const isPassMatch = timingSafeEqual(passwordHash, adminHash);

        if (!isUserMatch || !isPassMatch) {
          return null;
        }

        return {
          id: '1',
          name: adminUser,
          email: `${adminUser}@admin.local`,
        };
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
  secret: process.env.NEXTAUTH_SECRET,
};
