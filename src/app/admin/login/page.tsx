'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, WifiOff, Loader2 } from 'lucide-react';
import { C, headingFont, bodyFont } from '@/components/gislaine/constants';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [networkError, setNetworkError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      usernameRef.current?.focus();
    }
  }, [mounted]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setNetworkError(false);

      const trimmedUser = username.trim();
      const trimmedPass = password.trim();

      if (!trimmedUser || !trimmedPass) {
        setError('Informe usuário e senha.');
        return;
      }

      setLoading(true);

      try {
        const result = await signIn('credentials', {
          username: trimmedUser,
          password: trimmedPass,
          redirect: false,
        });

        if (result?.error) {
          setError('Usuário ou senha inválidos.');
          return;
        }

        router.push('/admin/dashboard');
        router.refresh();
      } catch {
        setNetworkError(true);
        setError('Erro de conexão. Tente novamente.');
      } finally {
        setLoading(false);
      }
    },
    [username, password, router]
  );

  const togglePassword = useCallback(() => setShowPassword((s) => !s), []);

  return (
    <main
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: C.primary }}
    >
      {/* Gradient layers */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(223,130,60,0.15) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 20% 80%, rgba(25,57,108,0.4) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 80% 20%, rgba(25,57,108,0.3) 0%, transparent 60%),
            radial-gradient(ellipse 100% 100% at 50% 50%, rgba(25,57,108,0.05) 0%, transparent 80%),
            linear-gradient(135deg, rgba(25,57,108,0.95) 0%, rgba(25,57,108,1) 50%, rgba(20,48,88,1) 100%)
          `,
        }}
        aria-hidden="true"
      />
      {/* Subtle noise/texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-6 py-16 flex flex-col items-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12"
        >
          <a
            href="/"
            className="flex flex-col items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded"
          >
            <img
              src="/images/gislaine/logo-icon-only.webp"
              alt="Gislaine Lozano"
              className="h-14 w-auto"
              loading="eager"
            />
            <span
              className="text-white text-[10px] uppercase tracking-[0.3em] font-semibold"
              style={headingFont}
            >
              Gislaine Lozano
            </span>
          </a>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          <div className="mb-8 text-center">
            <h2
              className="text-2xl sm:text-3xl mb-2 text-white"
              style={headingFont}
            >
              Acesse o painel
            </h2>
            <p className="text-sm text-white/60" style={bodyFont}>
              Entre com suas credenciais para gerenciar conteúdo e leads.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="username"
                className="block text-[11px] font-semibold uppercase tracking-[0.15em] mb-2 text-white/80"
                style={bodyFont}
              >
                Usuário
              </label>
                <input
                  ref={usernameRef}
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 text-sm outline-none transition-all focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: C.white,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    borderRadius: 0,
                    ...bodyFont,
                  }}
                  placeholder="Digite seu usuário"
                  required
                  autoComplete="username"
                  maxLength={100}
                  aria-describedby={error ? 'login-error' : undefined}
                  aria-invalid={error ? true : undefined}
                />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[11px] font-semibold uppercase tracking-[0.15em] mb-2 text-white/80"
                style={bodyFont}
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 text-sm outline-none transition-all focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: C.white,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    borderRadius: 0,
                    ...bodyFont,
                  }}
                  placeholder="Digite sua senha"
                  required
                  autoComplete="current-password"
                  maxLength={200}
                  aria-describedby={error ? 'login-error' : undefined}
                  aria-invalid={error ? true : undefined}
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-sm transition-colors text-white/50 hover:text-white/80"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                id="login-error"
                className="text-sm flex items-center gap-2 px-3 py-2.5"
                style={{ color: C.error, backgroundColor: '#FEF2F2', ...bodyFont }}
                role="alert"
              >
                {networkError ? <WifiOff size={16} /> : <AlertCircle size={16} />}
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-sm font-semibold uppercase tracking-[0.12em] disabled:opacity-60 disabled:cursor-not-allowed transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 flex items-center justify-center gap-2"
              style={{
                backgroundColor: C.accent,
                color: C.white,
                borderRadius: 0,
                ...bodyFont,
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar no painel'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </main>
  );
}
