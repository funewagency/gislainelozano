'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { C } from '@/components/gislaine/constants';
import { ChevronDown, ChevronUp, Search, ExternalLink, Calendar, Trash2, X } from 'lucide-react';

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

interface LeadsTableProps {
  leads: Lead[];
  loading?: boolean;
  onDeleted?: (ids: string[]) => void;
}

type SortField = 'name' | 'email' | 'createdAt' | 'source';
type SortDir = 'asc' | 'desc';

const SOURCE_LABELS: Record<string, string> = {
  google: 'Google',
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  twitter: 'Twitter',
  direct: 'Direto',
  'whatsapp-fab': 'WhatsApp Fab',
  'contact-section': 'Seção Contato',
};

const DETAIL_SOURCE_LABELS: Record<string, string> = {
  ...SOURCE_LABELS,
  direct: 'Acesso Direto',
  'whatsapp-fab': 'Botão WhatsApp',
  'contact-section': 'Seção Contato',
};

const COLUMNS: { key: SortField; label: string }[] = [
  { key: 'name', label: 'Nome' },
  { key: 'email', label: 'Email' },
  { key: 'source', label: 'Origem' },
  { key: 'createdAt', label: 'Data' },
];

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (sortField !== field) return null;
  return sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
}

export function LeadsTable({ leads, loading, onDeleted }: LeadsTableProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Clear stale selections when the underlying rows change (e.g. after a reload).
  const visibleIds = useMemo(() => leads.map((l) => l.id), [leads]);
  useEffect(() => {
    setSelectedIds((prev) => new Set(Array.from(prev).filter((id) => visibleIds.includes(id))));
  }, [visibleIds]);

  const filtered = useMemo(() => {
    if (!search.trim()) return leads;
    const q = search.toLowerCase();
    return leads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.phone.includes(q)
    );
  }, [leads, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'createdAt') {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        cmp = (a[sortField] || '').localeCompare(b[sortField] || '');
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }

  function toggleSelection(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectPage(all: boolean) {
    setSelectedIds(all ? new Set(sorted.map((l) => l.id)) : new Set());
  }

  async function handleBulkDelete() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (
      !confirm(
        `Tem certeza que deseja excluir ${ids.length} lead(s) selecionado(s)? Esta ação não pode ser desfeita.`,
      )
    ) {
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || `Erro ${res.status}`);
      }
      setSelectedIds(new Set());
      setDeleteError(null);
      onDeleted?.(ids);
    } catch (err) {
      setDeleteError((err as Error).message || 'Falha ao excluir leads.');
    } finally {
      setDeleting(false);
    }
  }

  async function handleRowDelete(lead: Lead) {
    if (
      !confirm(`Tem certeza que deseja excluir o lead "${lead.name}"? Esta ação não pode ser desfeita.`)
    ) {
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/leads?id=${encodeURIComponent(lead.id)}`, { method: 'DELETE' });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || `Erro ${res.status}`);
      }
      setSelectedLead(null);
      onDeleted?.([lead.id]);
    } catch (err) {
      setDeleteError((err as Error).message || 'Falha ao excluir lead.');
    } finally {
      setDeleting(false);
    }
  }

  const allSelected = sorted.length > 0 && sorted.every((l) => selectedIds.has(l.id));

  return (
    <div>
      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, email ou telefone..."
          aria-label="Buscar leads"
          maxLength={200}
          className="w-full pl-10 pr-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-g-accent transition-all"
          style={{
            border: `1px solid ${C.inactive}`,
            color: C.text,
            backgroundColor: C.white,
            borderRadius: 0,
          }}
        />
      </div>

      {/* Bulk action toolbar */}
      {selectedIds.size > 0 && (
        <div
          className="flex items-center justify-between px-3 py-2.5 mb-4 text-sm"
          style={{ backgroundColor: C.surfaceAlt, borderBottom: `1px solid ${C.border}` }}
        >
          <span style={{ color: C.text }}>{selectedIds.size} selecionado(s)</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => selectPage(false)}
              className="px-2 py-1 text-xs font-medium transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2"
              style={{ color: C.muted, borderRadius: 0 }}
              aria-label="Limpar seleção"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2"
              style={{ backgroundColor: C.error, borderRadius: 0 }}
              aria-label={`Excluir ${selectedIds.size} leads selecionados`}
            >
              <Trash2 size={13} aria-hidden="true" />
              Excluir selecionados
            </button>
          </div>
        </div>
      )}

      {deleteError && (
        <div
          className="flex items-center gap-2 px-3 py-2 mb-4 text-sm"
          role="alert"
          style={{ backgroundColor: '#FEF2F2', color: C.error, borderBottom: `1px solid ${C.error}` }}
        >
          <X size={14} />
          <span className="flex-1">{deleteError}</span>
          <button
            type="button"
            onClick={() => setDeleteError(null)}
            className="ml-auto text-xs font-medium underline"
            style={{ color: C.error }}
          >
            Fechar
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${C.border}`, backgroundColor: C.surface }}>
              <th className="px-4 py-3 w-10 text-left" style={{ color: C.muted }}>                {!allSelected ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectPage(true);
                    }}
                    className="p-0.5 focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2"
                    aria-label="Selecionar todos da página"
                  >
                    <span
                      className="block w-4 h-4"
                      style={{
                        border: `1.5px solid ${selectedIds.size > 0 ? C.accent : C.muted}`,
                        borderRadius: 2,
                      }}
                    />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectPage(false);
                    }}
                    className="p-0.5 focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2"
                    aria-label="Desmarcar todos da página"
                  >
                    <X size={14} style={{ color: C.accent }} />
                  </button>
                )}
              </th>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left font-medium cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2 focus-visible:bg-surface"
                  style={{ color: C.muted }}
                  onClick={() => toggleSort(col.key)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleSort(col.key);
                    }
                  }}
                  aria-sort={sortField === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    <SortIcon field={col.key} sortField={sortField} sortDir={sortDir} />
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 text-left font-medium" style={{ color: C.muted }}>
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: C.muted }}>
                  Carregando...
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: C.muted }}>
                  Nenhum lead encontrado.
                </td>
              </tr>
            ) : (
              sorted.map((lead) => {
                const rowSelected = selectedIds.has(lead.id);
                return (
                  <tr
                    key={lead.id}
                    className="transition-colors cursor-pointer hover:bg-surface focus-within:bg-surface"
                    style={{ borderBottom: `1px solid ${C.border}` }}
                    onClick={() => setSelectedLead(lead)}
                  >
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                      aria-label={rowSelected ? 'Lead selecionado' : 'Selecionar lead'}
                    >
                      <input
                        type="checkbox"
                        checked={rowSelected}
                        onChange={() => toggleSelection(lead.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded-sm"
                        style={{ accentColor: C.accent }}
                        aria-checked={rowSelected}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium max-w-[200px]" style={{ color: C.text }}>
                      <span className="block truncate">{lead.name}</span>
                    </td>
                    <td className="px-4 py-3 max-w-[220px]" style={{ color: C.muted }}>
                      <span className="block truncate">{lead.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-block px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: lead.source ? `${C.accent}15` : C.surfaceAlt,
                          color: lead.source ? C.accentDark : C.muted,
                        }}
                      >
                        {SOURCE_LABELS[lead.source || ''] || lead.source || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: C.muted }}>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} />
                        {new Date(lead.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-70 focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2 rounded-sm"
                          style={{ color: C.accentDark }}
                          type="button"
                        >
                          <ExternalLink size={13} aria-hidden="true" />
                          Detalhes
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Drawer */}
      {selectedLead && (
        <LeadDetailDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onDelete={handleRowDelete}
          deleting={deleting}
        />
      )}
    </div>
  );
}

interface LeadDetailDrawerProps {
  lead: Lead;
  onClose: () => void;
  onDelete: (lead: Lead) => void;
  deleting: boolean;
}

function LeadDetailDrawer({ lead, onClose, onDelete, deleting }: LeadDetailDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = drawerRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable[0]?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const f = el.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (e.shiftKey && document.activeElement === f[0]) {
        e.preventDefault();
        f[f.length - 1]?.focus();
      } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
        e.preventDefault();
        f[0]?.focus();
      }
    };
    el.addEventListener('keydown', trap);
    return () => el.removeEventListener('keydown', trap);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="lead-detail-title">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} role="presentation" />
      <div
        ref={drawerRef}
        className="relative w-full max-w-md h-full overflow-y-auto p-6"
        style={{ backgroundColor: C.white }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 id="lead-detail-title" className="text-lg font-semibold" style={{ color: C.primary }}>
            Detalhes do Lead
          </h3>
          <button
            onClick={onClose}
            className="p-1 transition-opacity hover:opacity-70"
            style={{ color: C.muted }}
            aria-label="Fechar detalhes"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <Field label="Nome" value={lead.name} />
          <Field label="Email" value={lead.email} />
          <Field label="WhatsApp" value={lead.phone} />
          {lead.message && <Field label="Mensagem" value={lead.message} />}
          <Field
            label="Origem"
            value={DETAIL_SOURCE_LABELS[lead.source || ''] || lead.source || 'Desconhecida'}
          />
          {lead.medium && <Field label="Mídia" value={lead.medium} />}
          {lead.campaign && <Field label="Campanha" value={lead.campaign} />}
          <Field
            label="Data"
            value={new Date(lead.createdAt).toLocaleDateString('pt-BR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          />
        </div>

        <div className="flex items-center gap-3 mt-6">
          <a
            href={lead.phone ? `https://wa.me/55${lead.phone.replace(/\D/g, '')}` : '#'}
            target={lead.phone ? '_blank' : undefined}
            rel={lead.phone ? 'noopener noreferrer' : undefined}
            aria-disabled={!lead.phone}
            className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold no-underline transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2"
            style={{
              backgroundColor: C.whatsapp,
              color: C.white,
              borderRadius: 0,
              pointerEvents: lead.phone ? 'auto' : 'none',
            }}
          >
            Falar no WhatsApp
          </a>
          <button
            type="button"
            onClick={() => onDelete(lead)}
            disabled={deleting}
            className="flex items-center justify-center gap-2 w-auto px-3 py-3 text-sm font-semibold text-white no-underline transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2"
            style={{ backgroundColor: C.error, borderRadius: 0 }}
            aria-label="Excluir este lead"
          >
            <Trash2 size={16} aria-hidden="true" />
            <span className="sr-only">Excluir</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider mb-0.5" style={{ color: C.muted }}>
        {label}
      </dt>
      <dd className="text-sm" style={{ color: C.text, wordBreak: 'break-word' }}>
        {value}
      </dd>
    </div>
  );
}
