'use client';

import { useCmsEditor } from '@/lib/cms-store';
import { C } from '@/components/gislaine/constants';
import { Clock, RotateCcw, CheckCircle2, User } from 'lucide-react';

export function RevisionHistory() {
  const revisions = useCmsEditor(s => s.revisions);
  const data = useCmsEditor(s => s.data);
  const revertToRevision = useCmsEditor(s => s.revertToRevision);

  if (revisions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ backgroundColor: C.surfaceAlt, border: `1.5px solid ${C.border}` }}
        >
          <Clock size={22} style={{ color: C.muted }} />
        </div>
        <p className="text-sm font-semibold" style={{ color: C.text }}>Nenhuma revisão ainda</p>
        <p className="text-xs mt-1" style={{ color: C.muted }}>
          Salve o conteúdo para criar a primeira revisão
        </p>
      </div>
    );
  }

  const handleRevert = (rev: any) => {
    if (typeof window !== 'undefined' && window.confirm('Deseja restaurar esta revisão? Alterações não salvas serão substituídas.')) {
      revertToRevision(rev);
    }
  };

  const handleKeyDown = (rev: any) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRevert(rev);
    }
  };

  return (
    <div className="px-5 py-5">
      <div className="flex items-center gap-2 mb-5">
        <Clock size={14} style={{ color: C.accent }} />
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.muted }}>
          Histórico de Revisões
        </p>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full ml-auto"
          style={{ backgroundColor: C.surfaceAlt, color: C.muted, border: `1px solid ${C.border}` }}
        >
          {revisions.length + 1} versões
        </span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div
          className="absolute left-4 top-5 bottom-5 w-px"
          style={{ backgroundColor: C.border }}
        />

        <div className="space-y-2">
          {/* Current version (top) */}
          <div
            className="relative flex items-start gap-3"
          >
            {/* Timeline dot */}
            <div
              className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${C.accent} 0%, ${C.accentLight} 100%)`,
                boxShadow: `0 0 0 3px ${C.accent}25, 0 2px 6px ${C.accent}40`,
              }}
            >
              <CheckCircle2 size={14} style={{ color: C.white }} />
            </div>

            {/* Content card */}
            <div
              className="flex-1 min-w-0 p-3 rounded-xl"
              style={{
                backgroundColor: `${C.accent}08`,
                border: `1.5px solid ${C.accent}30`,
              }}
            >
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-bold" style={{ color: C.primary }}>
                  Versão atual
                </span>
                <span
                  className="text-[9px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ backgroundColor: C.accent, color: C.white }}
                >
                  ATUAL
                </span>
              </div>
              <p className="text-[11px]" style={{ color: C.muted }}>
                v{data.meta.version} ·{' '}
                {data.meta.lastSaved
                  ? new Date(data.meta.lastSaved).toLocaleString('pt-BR')
                  : 'Ainda não salvo'}
              </p>
            </div>
          </div>

          {/* Past revisions */}
          {revisions.map((rev, idx) => (
            <div
              key={`${rev.version}-${rev.timestamp}`}
              role="button"
              tabIndex={0}
              className="relative flex items-start gap-3 group cursor-pointer"
              onClick={() => handleRevert(rev)}
              onKeyDown={handleKeyDown(rev)}
            >
              {/* Timeline dot */}
              <div
                className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-110"
                style={{
                  backgroundColor: C.white,
                  border: `2px solid ${C.border}`,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                }}
              >
                <span className="text-[10px] font-bold" style={{ color: C.muted }}>
                  {revisions.length - idx}
                </span>
              </div>

              {/* Content card */}
              <div
                className="flex-1 min-w-0 p-3 rounded-xl transition-all duration-200 group-hover:shadow-sm"
                style={{
                  backgroundColor: C.white,
                  border: `1.5px solid ${C.border}`,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate" style={{ color: C.text }}>
                      v{rev.version} — {rev.summary}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[11px]" style={{ color: C.muted }}>
                        {new Date(rev.timestamp).toLocaleString('pt-BR')}
                      </p>
                      {rev.createdBy && (
                        <span
                          className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: C.surfaceAlt, color: C.muted }}
                        >
                          <User size={8} />
                          por {rev.createdBy}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Restore button – appears on hover */}
                  <div
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-all duration-200 shrink-0"
                    style={{
                      backgroundColor: `${C.primary}10`,
                      color: C.primary,
                      border: `1px solid ${C.primary}20`,
                    }}
                  >
                    <RotateCcw size={10} />
                    Restaurar
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
