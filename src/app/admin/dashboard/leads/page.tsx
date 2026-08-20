'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { C } from '@/components/gislaine/constants';
import { LeadsTable } from '@/components/admin/leads-table';
import { TableSkeleton } from '@/components/admin/admin-skeleton';
import { RetryBanner } from '@/components/admin/admin-skeleton';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string | null;
  source: string | null;
  medium: string | null;
  campaign: string | null;
  createdAt: string;
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  async function loadLeads(page = 1) {
    setLoading(true);
    setError(null);
    setCurrentPage(page);

    try {
      const res = await fetch(`/api/admin/leads?page=${page}&limit=50`);

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Erro ${res.status}`);
      }

      const data = await res.json();
      setLeads(data.leads ?? []);
      setPagination(data.pagination ?? { page: 1, totalPages: 1, total: 0 });

      // If deletion emptied the current page but records remain, step back a page.
      if (page > 1 && (data.leads?.length ?? 0) === 0 && data.pagination?.total > 0) {
        void loadLeads(page - 1);
      }
    } catch (err) {
      const message = (err as Error).message || 'Falha ao carregar leads';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeads();
  }, []);

  // Refreshes the current page after a delete without resetting to page 1.
  const handleDeleted = useCallback(
    (deletedIds: string[]) => {
      void loadLeads(currentPage);
    },
    [currentPage],
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-outfit)', color: C.primary }}>
          Leads
        </h1>
        {!error && (
          <span className="text-sm" style={{ color: C.muted }}>
            {pagination.total} registro{pagination.total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {error && (
        <div className="mb-6">
          <RetryBanner onRetry={() => loadLeads(currentPage)} message={error} />
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={8} />
      ) : (
        <LeadsTable leads={leads} loading={false} onDeleted={handleDeleted} />
      )}

      {/* Pagination */}
      {!error && pagination.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          onPageChange={loadLeads}
        />
      )}
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = useMemo(() => {
    const delta = 2;
    const range: (number | string)[] = [];
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }
    if (currentPage - delta > 2) range.unshift('...');
    if (currentPage + delta < totalPages - 1) range.push('...');
    return [1, ...range, totalPages];
  }, [currentPage, totalPages]);

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-6 flex-wrap" aria-label="Navegação de páginas">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2"
        style={{ color: C.muted, border: `1px solid ${C.border}`, borderRadius: 0 }}
        aria-label="Página anterior"
      >
        Anterior
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-sm" style={{ color: C.muted }}>...</span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p as number)}
            className="min-w-[2.25rem] px-3 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2"
            style={{
              backgroundColor: p === currentPage ? C.primary : 'transparent',
              color: p === currentPage ? C.white : C.muted,
              border: p === currentPage ? 'none' : `1px solid ${C.border}`,
              borderRadius: 0,
            }}
            aria-current={p === currentPage ? 'page' : undefined}
            aria-label={`Página ${p}`}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2"
        style={{ color: C.muted, border: `1px solid ${C.border}`, borderRadius: 0 }}
        aria-label="Próxima página"
      >
        Próxima
      </button>
    </nav>
  );
}
