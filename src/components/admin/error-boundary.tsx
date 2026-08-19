'use client';

import { Component, createElement } from 'react';
import { C } from '@/components/gislaine/constants';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    if (typeof window !== 'undefined' && 'Sentry' in window) {
      const sentry = (window as any).Sentry;
      sentry?.captureException?.(error);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return createElement(AdminErrorFallback, {
        error: this.state.error,
        onReset: () => this.setState({ hasError: false, error: null }),
      });
    }

    return this.props.children;
  }
}

export function AdminErrorFallback({
  error,
  onReset,
}: {
  error: Error | null;
  onReset?: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="text-center max-w-md">
        <div
          className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
          style={{ backgroundColor: '#FEE2E2' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-outfit)', color: C.primary }}>
          Algo deu errado
        </h2>
        <p className="text-sm mb-4" style={{ color: C.muted }}>
          Ocorreu um erro inesperado nesta seção.
          {error?.message && (
            <span className="block mt-1 text-xs font-mono" style={{ color: C.error }}>
              {error.message}
            </span>
          )}
        </p>
        {onReset && (
          <button
            onClick={onReset}
            className="px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2"
            style={{ backgroundColor: C.accent, color: C.white, borderRadius: 0 }}
            type="button"
          >
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  );
}
