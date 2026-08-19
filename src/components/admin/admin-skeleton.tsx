import { C } from '@/components/gislaine/constants';
import { AlertTriangle, RefreshCw } from 'lucide-react';

// ── Shimmer keyframe (injected once via style tag) ───────────────────

function ShimmerStyle() {
  return (
    <style>{`
      @keyframes shimmer {
        0% { background-position: -400px 0; }
        100% { background-position: 400px 0; }
      }
      .shimmer {
        background: linear-gradient(
          90deg,
          ${C.border} 0%,
          ${C.surfaceAlt} 40%,
          #e9ebee 60%,
          ${C.border} 100%
        );
        background-size: 800px 100%;
        animation: shimmer 1.4s infinite linear;
      }
    `}</style>
  );
}

function ShimmerBlock({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`shimmer rounded-xl ${className}`} style={style} />;
}

// ── KpiSkeleton ──────────────────────────────────────────────────────

export function KpiSkeleton() {
  return (
    <>
      <ShimmerStyle />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl"
            style={{ backgroundColor: C.white, border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
          >
            <ShimmerBlock className="h-3 w-16 mb-3" />
            <ShimmerBlock className="h-8 w-24 mb-2" />
            <ShimmerBlock className="h-3 w-20" />
          </div>
        ))}
      </div>
    </>
  );
}

// ── ChartSkeleton ────────────────────────────────────────────────────

export function ChartSkeleton({ height = 250 }: { height?: number }) {
  return (
    <>
      <ShimmerStyle />
      <div
        className="p-5 rounded-2xl"
        style={{ backgroundColor: C.white, border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
      >
        <ShimmerBlock className="h-4 w-40 mb-5" />
        <ShimmerBlock style={{ height }} />
      </div>
    </>
  );
}

// ── TableSkeleton ────────────────────────────────────────────────────

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      <ShimmerStyle />
      <div
        className="overflow-hidden rounded-2xl"
        style={{ border: `1px solid ${C.border}`, backgroundColor: C.white, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
      >
        <div
          className="grid grid-cols-5 px-5 py-3"
          style={{ borderBottom: `1.5px solid ${C.border}`, backgroundColor: C.surface }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <ShimmerBlock key={i} className="h-3 w-16" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, row) => (
          <div
            key={row}
            className="grid grid-cols-5 items-center px-5 py-4"
            style={{ borderBottom: `1px solid ${C.border}` }}
          >
            {Array.from({ length: 5 }).map((_, col) => (
              <ShimmerBlock
                key={col}
                className="h-4"
                style={{ width: col === 0 ? '60%' : col === 3 ? '40%' : '80%' }}
              />
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

// ── RetryBanner ──────────────────────────────────────────────────────

export function RetryBanner({ onRetry, message }: { onRetry: () => void; message?: string }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm"
      style={{
        backgroundColor: '#FEF2F2',
        color: C.error,
        border: `1.5px solid ${C.error}25`,
        boxShadow: `0 2px 8px ${C.error}10`,
      }}
    >
      <AlertTriangle size={16} className="shrink-0" />
      <span className="flex-1 font-medium">{message || 'Falha ao carregar dados.'}</span>
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2"
        style={{ backgroundColor: C.error, color: C.white, boxShadow: `0 2px 6px ${C.error}40` }}
        type="button"
      >
        <RefreshCw size={11} />
        Tentar novamente
      </button>
    </div>
  );
}

// ── EmptyState ───────────────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ backgroundColor: C.surfaceAlt, border: `1.5px solid ${C.border}`, color: C.muted }}
        >
          {icon}
        </div>
      )}
      <h3 className="text-sm font-bold mb-1.5" style={{ color: C.text }}>{title}</h3>
      {description && (
        <p className="text-xs mb-5 max-w-xs leading-relaxed" style={{ color: C.muted }}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
