'use client';

import { useState, useCallback, useEffect } from 'react';
import { C, bodyFont, headingFont } from '@/components/gislaine/constants';
import {
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Check,
  X,
  AlertCircle,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Briefcase,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────

interface Service {
  id: string;
  order: number;
  title: string;
  subtitle: string | null;
  description: string;
  ctaText: string;
  ctaLink: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
}

const EMPTY_FORM: FormData = {
  title: '',
  subtitle: '',
  description: '',
  ctaText: '',
  ctaLink: '',
  isActive: true,
};

const MAX_SERVICES = 5;

// ── Inline alert ──────────────────────────────────────────────────────────

function Alert({ type, message }: { type: 'success' | 'error'; message: string }) {
  const isSuccess = type === 'success';
  return (
    <div
      className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm"
      style={{
        backgroundColor: isSuccess ? '#ECFDF5' : '#FEF2F2',
        border: `1px solid ${isSuccess ? '#6EE7B7' : '#FECACA'}`,
        color: isSuccess ? '#065F46' : '#991B1B',
        ...bodyFont,
      }}
    >
      {isSuccess ? (
        <Check size={16} className="shrink-0 mt-0.5" />
      ) : (
        <AlertCircle size={16} className="shrink-0 mt-0.5" />
      )}
      <span>{message}</span>
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: C.primary, ...bodyFont }}
      >
        {label}
        {required && <span style={{ color: C.accent }}> *</span>}
      </label>
      {children}
      {hint && (
        <span className="text-[11px]" style={{ color: C.muted, ...bodyFont }}>
          {hint}
        </span>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 8,
  border: `1px solid ${C.border}`,
  backgroundColor: C.white,
  color: C.text,
  fontSize: 13,
  outline: 'none',
  ...bodyFont,
};

// ── Service Form ──────────────────────────────────────────────────────────

function ServiceForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: FormData;
  onSave: (data: FormData) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormData>(initial);

  const set = (key: keyof FormData, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Título" required>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Ex: Consultoria Estratégica"
            maxLength={200}
            required
            style={inputStyle}
          />
        </Field>

        <Field label="Subtítulo" hint="Opcional — aparece abaixo do título em destaque">
          <input
            type="text"
            value={form.subtitle}
            onChange={(e) => set('subtitle', e.target.value)}
            placeholder="Ex: Diagnóstico, direção e estrutura"
            maxLength={200}
            style={inputStyle}
          />
        </Field>
      </div>

      <Field label="Descrição" required>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Descreva o serviço de forma detalhada…"
          maxLength={5000}
          required
          rows={5}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Texto do Botão CTA" required hint="Texto exibido no botão de ação">
          <input
            type="text"
            value={form.ctaText}
            onChange={(e) => set('ctaText', e.target.value)}
            placeholder="Ex: Quero saber mais"
            maxLength={200}
            required
            style={inputStyle}
          />
        </Field>

        <Field
          label="Link do Botão (URL)"
          hint="Opcional — deixe vazio para abrir o modal do WhatsApp"
        >
          <input
            type="text"
            value={form.ctaLink}
            onChange={(e) => set('ctaLink', e.target.value)}
            placeholder="https://wa.me/… ou #contato"
            maxLength={500}
            style={inputStyle}
          />
        </Field>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => set('isActive', !form.isActive)}
          className="flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: form.isActive ? C.success : C.muted, ...bodyFont }}
        >
          {form.isActive ? (
            <ToggleRight size={22} style={{ color: C.success }} />
          ) : (
            <ToggleLeft size={22} style={{ color: C.muted }} />
          )}
          {form.isActive ? 'Serviço ativo' : 'Serviço inativo'}
        </button>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all"
          style={{
            backgroundColor: C.primary,
            color: C.white,
            opacity: saving ? 0.7 : 1,
            ...bodyFont,
          }}
        >
          {saving ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Check size={15} />
          )}
          Salvar serviço
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl transition-all"
          style={{
            backgroundColor: C.surfaceAlt,
            color: C.muted,
            ...bodyFont,
          }}
        >
          <X size={15} />
          Cancelar
        </button>
      </div>
    </form>
  );
}

// ── Service Card ──────────────────────────────────────────────────────────

function ServiceCard({
  service,
  index,
  total,
  onEdit,
  onDelete,
  onToggleActive,
  onMoveUp,
  onMoveDown,
  deleting,
}: {
  service: Service;
  index: number;
  total: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  deleting: boolean;
}) {
  const number = String(index + 1).padStart(2, '0');

  return (
    <div
      className="relative rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        backgroundColor: C.white,
        border: `1px solid ${service.isActive ? C.border : C.inactive}`,
        opacity: service.isActive ? 1 : 0.65,
        boxShadow: '0 1px 3px rgba(26,28,32,0.04)',
      }}
    >
      {/* Top accent bar */}
      <div
        className="h-[3px] w-full"
        style={{ backgroundColor: service.isActive ? C.accent : C.inactive }}
      />

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Number badge */}
          <span
            className="text-2xl font-bold shrink-0 leading-none mt-0.5"
            style={{ ...headingFont, color: C.accent, opacity: 0.7 }}
          >
            {number}
          </span>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <h3
                  className="font-bold text-base leading-snug truncate"
                  style={{ ...headingFont, color: C.primary }}
                >
                  {service.title}
                </h3>
                {service.subtitle && (
                  <p
                    className="text-sm mt-0.5"
                    style={{ ...bodyFont, color: C.accent }}
                  >
                    {service.subtitle}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Reorder */}
                <button
                  type="button"
                  onClick={onMoveUp}
                  disabled={index === 0}
                  title="Mover para cima"
                  className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                  style={{ color: C.muted, backgroundColor: C.surfaceAlt }}
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={onMoveDown}
                  disabled={index === total - 1}
                  title="Mover para baixo"
                  className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                  style={{ color: C.muted, backgroundColor: C.surfaceAlt }}
                >
                  <ChevronDown size={14} />
                </button>

                {/* Toggle active */}
                <button
                  type="button"
                  onClick={onToggleActive}
                  title={service.isActive ? 'Desativar serviço' : 'Ativar serviço'}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{
                    color: service.isActive ? C.success : C.muted,
                    backgroundColor: service.isActive ? '#ECFDF5' : C.surfaceAlt,
                  }}
                >
                  {service.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                </button>

                {/* Edit */}
                <button
                  type="button"
                  onClick={onEdit}
                  title="Editar serviço"
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: C.primary, backgroundColor: `${C.primary}12` }}
                >
                  <Pencil size={14} />
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={deleting}
                  title="Excluir serviço"
                  className="p-1.5 rounded-lg transition-colors disabled:opacity-50"
                  style={{ color: C.errorDark, backgroundColor: '#FEF2F2' }}
                >
                  {deleting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>
            </div>

            {/* Description preview */}
            <p
              className="text-sm mt-3 leading-relaxed line-clamp-2"
              style={{ ...bodyFont, color: C.muted }}
            >
              {service.description}
            </p>

            {/* CTA info */}
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{
                  backgroundColor: `${C.accent}15`,
                  color: C.accent,
                  ...bodyFont,
                }}
              >
                {service.ctaText}
              </span>
              {service.ctaLink && (
                <span
                  className="text-xs truncate max-w-[200px]"
                  style={{ color: C.muted, ...bodyFont }}
                  title={service.ctaLink}
                >
                  🔗 {service.ctaLink}
                </span>
              )}
              {!service.ctaLink && (
                <span
                  className="text-xs"
                  style={{ color: C.muted, ...bodyFont }}
                >
                  → Abre modal WhatsApp
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────

export function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  const showFeedback = useCallback((type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/services');
      if (!res.ok) throw new Error('Falha ao carregar serviços');
      const data = await res.json();
      setServices(data.services);
    } catch {
      showFeedback('error', 'Erro ao carregar serviços. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [showFeedback]);

  // Load on mount
  useEffect(() => { load(); }, [load]);

  const handleCreate = async (form: FormData) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Erro ao criar serviço');
      }
      await load();
      setEditingId(null);
      showFeedback('success', 'Serviço criado com sucesso!');
    } catch (err) {
      showFeedback('error', (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string, form: FormData) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Erro ao atualizar serviço');
      }
      await load();
      setEditingId(null);
      showFeedback('success', 'Serviço atualizado com sucesso!');
    } catch (err) {
      showFeedback('error', (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir serviço');
      await load();
      showFeedback('success', 'Serviço excluído com sucesso!');
    } catch (err) {
      showFeedback('error', (err as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      const res = await fetch(`/api/admin/services/${service.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !service.isActive }),
      });
      if (!res.ok) throw new Error('Erro ao alterar status');
      await load();
      showFeedback('success', service.isActive ? 'Serviço desativado.' : 'Serviço ativado!');
    } catch (err) {
      showFeedback('error', (err as Error).message);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newServices = [...services];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newServices.length) return;
    [newServices[index], newServices[targetIndex]] = [newServices[targetIndex], newServices[index]];
    setServices(newServices);
    setReordering(true);
    try {
      const res = await fetch('/api/admin/services/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: newServices.map((s) => s.id) }),
      });
      if (!res.ok) throw new Error('Erro ao reordenar');
      await load();
    } catch (err) {
      showFeedback('error', (err as Error).message);
      await load(); // revert
    } finally {
      setReordering(false);
    }
  };

  const canAdd = services.length < MAX_SERVICES;

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl animate-pulse"
            style={{ backgroundColor: C.border }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm" style={{ color: C.muted, ...bodyFont }}>
            {services.length} de {MAX_SERVICES} serviços cadastrados
          </p>
        </div>

        {!editingId && (
          <button
            type="button"
            onClick={() => setEditingId('new')}
            disabled={!canAdd}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: canAdd ? C.primary : C.inactive,
              color: C.white,
              ...bodyFont,
            }}
            title={!canAdd ? `Limite de ${MAX_SERVICES} serviços atingido` : 'Adicionar serviço'}
          >
            <Plus size={15} />
            Novo serviço
          </button>
        )}
      </div>

      {/* Feedback */}
      {feedback && <Alert type={feedback.type} message={feedback.message} />}

      {/* Limit warning */}
      {!canAdd && !editingId && (
        <div
          className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm"
          style={{
            backgroundColor: C.warning,
            border: `1px solid #FDE68A`,
            color: C.warningText,
            ...bodyFont,
          }}
        >
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>
            Você atingiu o limite máximo de <strong>{MAX_SERVICES} serviços</strong>. Exclua um
            existente para adicionar um novo.
          </span>
        </div>
      )}

      {/* New service form */}
      {editingId === 'new' && (
        <div
          className="rounded-2xl p-5"
          style={{
            backgroundColor: C.white,
            border: `1px solid ${C.accent}40`,
            boxShadow: `0 4px 16px ${C.accent}10`,
          }}
        >
          <h3
            className="font-bold text-sm mb-4 flex items-center gap-2"
            style={{ ...headingFont, color: C.primary }}
          >
            <Plus size={15} style={{ color: C.accent }} />
            Novo serviço
          </h3>
          <ServiceForm
            initial={EMPTY_FORM}
            onSave={handleCreate}
            onCancel={() => setEditingId(null)}
            saving={saving}
          />
        </div>
      )}

      {/* Service list */}
      {services.length === 0 && !editingId && (
        <div
          className="flex flex-col items-center justify-center py-16 rounded-2xl"
          style={{ backgroundColor: C.surfaceAlt, border: `1px dashed ${C.border}` }}
        >
          <Briefcase size={36} style={{ color: C.inactive }} className="mb-3" />
          <p className="font-semibold text-sm" style={{ color: C.muted, ...bodyFont }}>
            Nenhum serviço cadastrado ainda
          </p>
          <p className="text-xs mt-1" style={{ color: C.inactive, ...bodyFont }}>
            Clique em "Novo serviço" para começar
          </p>
        </div>
      )}

      <div className={`flex flex-col gap-3 ${reordering ? 'pointer-events-none opacity-75' : ''}`}>
        {services.map((service, index) => (
          <div key={service.id}>
            {editingId === service.id ? (
              <div
                className="rounded-2xl p-5"
                style={{
                  backgroundColor: C.white,
                  border: `1px solid ${C.accent}40`,
                  boxShadow: `0 4px 16px ${C.accent}10`,
                }}
              >
                <h3
                  className="font-bold text-sm mb-4 flex items-center gap-2"
                  style={{ ...headingFont, color: C.primary }}
                >
                  <Pencil size={15} style={{ color: C.accent }} />
                  Editando: {service.title}
                </h3>
                <ServiceForm
                  initial={{
                    title: service.title,
                    subtitle: service.subtitle ?? '',
                    description: service.description,
                    ctaText: service.ctaText,
                    ctaLink: service.ctaLink ?? '',
                    isActive: service.isActive,
                  }}
                  onSave={(form) => handleUpdate(service.id, form)}
                  onCancel={() => setEditingId(null)}
                  saving={saving}
                />
              </div>
            ) : (
              <ServiceCard
                service={service}
                index={index}
                total={services.length}
                onEdit={() => setEditingId(service.id)}
                onDelete={() => handleDelete(service.id)}
                onToggleActive={() => handleToggleActive(service)}
                onMoveUp={() => handleMove(index, 'up')}
                onMoveDown={() => handleMove(index, 'down')}
                deleting={deletingId === service.id}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
