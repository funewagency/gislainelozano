'use client';

import { useEffect, useCallback, useState } from 'react';
import { useCmsEditor } from '@/lib/cms-store';
import { CmsEditor } from '@/components/admin/cms-editor';
import { C } from '@/components/gislaine/constants';
import { RetryBanner } from '@/components/admin/admin-skeleton';
import { globalConfigSchema } from '@/lib/cms-types';
import { DEFAULT_CMS_DATA } from '@/lib/cms-defaults';

export default function ContentPage() {
  const { setServerData, isDirty } = useCmsEditor();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/cms');
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Erro ${res.status}`);
      }
      const json = await res.json();
      if (json && json.data && json.revisions) {
        const result = globalConfigSchema.safeParse(json.data);
        if (result.success) {
          setServerData(result.data, json.revisions);
        } else {
          console.error('[CMS] Zod validation failed, falling back to defaults:', result.error.issues);
          const fallback = { ...DEFAULT_CMS_DATA, ...json.data };
          setServerData(fallback, json.revisions);
        }
      }
    } catch (err) {
      setError((err as Error).message || 'Erro ao carregar conteúdo');
    } finally {
      setLoading(false);
    }
  }, [setServerData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!isDirty) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-outfit)', color: C.primary }}>
            Conteúdo
          </h1>
          <p className="text-sm mt-1" style={{ color: C.muted }}>
            Edite todos os textos, imagens e a estrutura da página
          </p>
        </div>
        {isDirty && (
          <span
            className="text-[10px] px-2 py-1 font-medium"
            style={{ backgroundColor: C.warning, color: C.warningText }}
          >
            Alterações não salvas
          </span>
        )}
      </div>

      {error && (
        <div className="mb-6">
          <RetryBanner onRetry={loadData} message={error} />
        </div>
      )}

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-1/3" style={{ backgroundColor: C.border }} />
          <div className="h-96" style={{ backgroundColor: C.surfaceAlt }} />
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <CmsEditor />
        </div>
      )}
    </div>
  );
}
