'use client';

import { ReactNode, useState, useEffect, useRef } from 'react';
import { signOut, useSession, SessionProvider } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { C } from '@/components/gislaine/constants';
import { AdminErrorBoundary } from '@/components/admin/error-boundary';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const navItems = [
  { label: 'Conteúdo (CMS)', href: '/admin/dashboard/content', icon: FileText },
  { label: 'Painel', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Leads', href: '/admin/dashboard/leads', icon: Users },
  { label: 'Configurações', href: '/admin/dashboard/settings', icon: Settings },
];

const SIDEBAR_ID = 'admin-sidebar';

/** Returns initials from a name string */
function getInitials(name?: string | null): string {
  if (!name) return 'A';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const firstNavLinkRef = useRef<HTMLAnchorElement>(null);

  const isLoginPage = pathname === '/admin/login';
  const isPreviewPage = pathname === '/admin/preview';

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && sidebarOpen) setSidebarOpen(false);
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const timer = setTimeout(() => firstNavLinkRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [sidebarOpen]);

  useEffect(() => {
    if (sidebarOpen) return;
    const timer = setTimeout(() => menuButtonRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [sidebarOpen]);

  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar || !sidebarOpen) return;
    const focusableSelector = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = Array.from(sidebar.querySelectorAll<HTMLElement>(focusableSelector)).filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    sidebar.addEventListener('keydown', handler);
    return () => sidebar.removeEventListener('keydown', handler);
  }, [sidebarOpen]);

  /* ── Preview page: sem nenhum chrome, página limpa para o iframe ── */
  if (isPreviewPage) {
    return (
      <AdminErrorBoundary>{children}</AdminErrorBoundary>
    );
  }

  /* ── Login page: no chrome, just the content ── */
  if (isLoginPage) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F3F4F6' }}>
        <AdminErrorBoundary>{children}</AdminErrorBoundary>
      </div>
    );
  }

  const initials = getInitials(session?.user?.name);

  /* ── Dashboard pages: full sidebar + header ── */
  return (
    <div
      className="h-screen flex flex-col overflow-hidden admin-shell"
      style={{ backgroundColor: '#F0F2F5' }}
    >
      {/* ── Mobile header ── */}
      <header
        className="lg:hidden flex items-center justify-between px-4 py-3 shrink-0 shadow-md"
        style={{
          background: `linear-gradient(135deg, #0F2549 0%, ${C.primary} 100%)`,
        }}
      >
        <button
          ref={menuButtonRef}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg transition-colors"
          style={{ color: 'rgba(255,255,255,0.9)', backgroundColor: 'rgba(255,255,255,0.08)' }}
          aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={sidebarOpen}
          aria-controls={SIDEBAR_ID}
          type="button"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <span
          className="text-sm font-semibold tracking-wide"
          style={{ color: C.white, fontFamily: 'var(--font-outfit)' }}
        >
          Administrador
        </span>

        {/* Avatar mobile */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold select-none"
          style={{
            background: `linear-gradient(135deg, ${C.accent} 0%, ${C.accentLight} 100%)`,
            color: C.white,
          }}
        >
          {initials}
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* ── Sidebar ── */}
        <aside
          ref={sidebarRef}
          id={SIDEBAR_ID}
          aria-label="Navegação do painel"
          className={`fixed lg:static inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out lg:transform-none flex flex-col ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
          style={{
            background: `linear-gradient(180deg, #0F2549 0%, #16305E 50%, ${C.primary} 100%)`,
            boxShadow: '4px 0 24px rgba(0,0,0,0.18)',
          }}
        >
          {/* Sidebar header */}
          <div
            className="hidden lg:flex items-center gap-3 h-16 px-5 shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* Logo mark */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
              style={{
                background: `linear-gradient(135deg, ${C.accent} 0%, ${C.accentLight} 100%)`,
                color: C.white,
                boxShadow: `0 2px 8px ${C.accent}60`,
              }}
            >
              GL
            </div>
            <div className="min-w-0">
              <p
                className="text-sm font-bold leading-none truncate"
                style={{ color: C.white, fontFamily: 'var(--font-outfit)' }}
              >
                Gislaine Lozano
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Painel Administrativo
              </p>
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
            <p
              className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-3"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              Menu
            </p>
            {navItems.map((item, i) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  ref={i === 0 ? firstNavLinkRef : undefined}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-150 no-underline min-w-0 rounded-xl focus-visible:ring-2 focus-visible:ring-white/50 group relative"
                  style={{
                    backgroundColor: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                    color: isActive ? C.white : 'rgba(255,255,255,0.65)',
                  }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                      style={{ backgroundColor: C.accent }}
                    />
                  )}

                  {/* Icon container */}
                  <span
                    className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0 transition-all duration-150"
                    style={{
                      backgroundColor: isActive ? `${C.accent}30` : 'rgba(255,255,255,0.06)',
                      color: isActive ? C.accentLight : 'rgba(255,255,255,0.6)',
                    }}
                  >
                    <Icon size={15} aria-hidden="true" />
                  </span>

                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User footer */}
          <div
            className="px-3 py-4 shrink-0"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* User info */}
            {session?.user?.name && (
              <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 select-none"
                  style={{
                    background: `linear-gradient(135deg, ${C.accent} 0%, ${C.accentLight} 100%)`,
                    color: C.white,
                  }}
                >
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>
                    {session.user.name}
                  </p>
                  <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Administrador
                  </p>
                </div>
              </div>
            )}

            {/* Logout button */}
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium w-full transition-all duration-150 no-underline rounded-xl focus-visible:ring-2 focus-visible:ring-white/50 group"
              style={{ color: 'rgba(255,255,255,0.55)' }}
              type="button"
            >
              <span
                className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0 transition-all duration-150"
                style={{ backgroundColor: 'rgba(220,38,38,0.15)', color: 'rgba(248,113,113,0.8)' }}
              >
                <LogOut size={14} aria-hidden="true" />
              </span>
              <span className="group-hover:text-red-300 transition-colors">Sair</span>
            </button>
          </div>
        </aside>

        {/* ── Overlay on mobile ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 lg:hidden"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ── Main content ── */}
        <main
          className="flex-1 min-h-0 p-4 md:p-6 lg:p-8 overflow-auto"
          id="admin-main-content"
        >
          <AdminErrorBoundary>
            {children}
          </AdminErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AdminShell>{children}</AdminShell>
    </SessionProvider>
  );
}
