'use client';

import { useEffect, useState, useCallback, useRef, memo } from 'react';
import { useCmsEditor } from '@/lib/cms-store';
import { useSession } from 'next-auth/react';
import { SectionEditor, ThemeEditor } from './section-editor';
import { RevisionHistory } from './revision-history';
import { C } from '@/components/gislaine/constants';
import {
  Save, Eye, History, ToggleLeft, ToggleRight,
  Loader2, LayoutPanelLeft, CheckCircle2, AlertCircle, Palette,
  Monitor, Columns2, Rows2, Maximize2, ExternalLink, X, GripHorizontal,
  ArrowUp, ArrowDown, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';

type Tab = 'sections' | 'order' | 'revisions' | 'preview';
type PreviewMode = 'side' | 'stacked' | 'floating' | 'window' | 'tab';

const SECTION_LABELS: Record<string, string> = {
  navbar: 'Navbar',
  hero: 'Hero',
  painPoints: 'Para Quem É',
  bio: 'Sobre Mim',
  positioning: 'Posicionamento',
  services: 'Serviços',
  testimonials: 'Feedbacks',
  faq: 'FAQ',
  contact: 'Contato',
  whatsappModal: 'WhatsApp Modal',
  footer: 'Footer',
};

const PREVIEW_MODE_OPTIONS: { mode: PreviewMode; label: string; icon: typeof Monitor }[] = [
  { mode: 'side', label: 'Lado a lado', icon: Columns2 },
  { mode: 'stacked', label: 'Empilhado', icon: Rows2 },
  { mode: 'floating', label: 'Flutuante', icon: Maximize2 },
  { mode: 'window', label: 'Nova janela', icon: ExternalLink },
  { mode: 'tab', label: 'Nova aba', icon: ExternalLink },
];

/** Single draggable section row in the order list */
const SectionItem = memo(function SectionItem(raw: {
  label: string;
  enabled: boolean;
  onToggle: () => void;
  onMoveUp: (() => void) | null;
  onMoveDown: (() => void) | null;
}) {
  const { label, enabled, onToggle, onMoveUp, onMoveDown } = raw ?? {};

  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-150"
      style={{
        backgroundColor: enabled ? C.white : `${C.surfaceAlt}`,
        border: `1px solid ${enabled ? C.border : 'transparent'}`,
        boxShadow: enabled ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
        opacity: enabled ? 1 : 0.6,
      }}
    >
      {/* Reorder arrows */}
      <div className="flex flex-col gap-0.5 shrink-0">
        <button
          onClick={onMoveUp ?? (() => {})}
          disabled={!onMoveUp}
          className="p-0.5 rounded transition-all disabled:opacity-20 hover:scale-110 focus-visible:ring-2 focus-visible:ring-g-accent"
          style={{ color: C.muted }}
          aria-label="Mover para cima"
          type="button"
        >
          <ArrowUp size={11} />
        </button>
        <button
          onClick={onMoveDown ?? (() => {})}
          disabled={!onMoveDown}
          className="p-0.5 rounded transition-all disabled:opacity-20 hover:scale-110 focus-visible:ring-2 focus-visible:ring-g-accent"
          style={{ color: C.muted }}
          aria-label="Mover para baixo"
          type="button"
        >
          <ArrowDown size={11} />
        </button>
      </div>

      {/* Label */}
      <span className="flex-1 text-xs font-medium truncate" style={{ color: C.text }}>
        {label}
      </span>

      {/* Enabled badge */}
      <span
        className="text-[9px] font-semibold px-2 py-0.5 rounded-full shrink-0 transition-all duration-200"
        style={{
          backgroundColor: enabled ? `${C.success}15` : `${C.inactive}30`,
          color: enabled ? C.success : C.muted,
        }}
      >
        {enabled ? 'Ativo' : 'Oculto'}
      </span>

      {/* Toggle */}
      <button
        onClick={onToggle}
        className="shrink-0 p-1 rounded-lg transition-all duration-200 focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2"
        style={{ color: enabled ? C.accent : C.inactive }}
        aria-label={enabled ? 'Desativar seção' : 'Ativar seção'}
        type="button"
      >
        {enabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
      </button>
    </div>
  );
});

export function CmsEditor() {
  const data = useCmsEditor(s => s.data);
  const isDirty = useCmsEditor(s => s.isDirty);
  const isSaving = useCmsEditor(s => s.isSaving);
  const save = useCmsEditor(s => s.save);
  const toggleSectionEnabled = useCmsEditor(s => s.toggleSectionEnabled);
  const reorderSections = useCmsEditor(s => s.reorderSections);
  const { data: session } = useSession();
  const [tab, setTab] = useState<Tab>('sections');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('side');
  const [floatingPos, setFloatingPos] = useState({ x: 100, y: 100 });
  const [floatingSize, setFloatingSize] = useState({ w: 600, h: 700 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const previewIframeRef = useRef<HTMLIFrameElement>(null);
  const previewWindowRef = useRef<Window | null>(null);

  // ── Resizable split state ──────────────────────────────────────────
  const [editorWidthPct, setEditorWidthPct] = useState(38);
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const widthBeforeCollapse = useRef(38);

  // Send data to preview whenever it changes
  useEffect(() => {
    const payload = { type: 'cms-preview-update', data };
    if (previewIframeRef.current?.contentWindow) {
      previewIframeRef.current.contentWindow.postMessage(payload, '*');
    }
    if (previewWindowRef.current && !previewWindowRef.current.closed) {
      previewWindowRef.current.postMessage(payload, '*');
    }
  }, [data]);

  // Cleanup preview window on unmount
  useEffect(() => {
    return () => {
      if (previewWindowRef.current && !previewWindowRef.current.closed) {
        previewWindowRef.current.close();
      }
    };
  }, []);

  const handleSave = useCallback(async () => {
    setSaveStatus('saving');
    try {
      await save(session?.user?.name ?? 'Admin');
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [save, session?.user?.name]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (isDirty && !isSaving) handleSave();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, isDirty, isSaving]);

  const handleReorder = useCallback((index: number, direction: -1 | 1) => {
    reorderSections(index, index + direction);
  }, [reorderSections]);

  // ── Panel resize handlers ────────────────────────────────────────────
  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setEditorWidthPct(Math.min(70, Math.max(20, pct)));
    };
    const handleMouseUp = () => setIsResizing(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleCollapseToggle = useCallback(() => {
    if (isEditorCollapsed) {
      setIsEditorCollapsed(false);
    } else {
      widthBeforeCollapse.current = editorWidthPct;
      setIsEditorCollapsed(true);
    }
  }, [isEditorCollapsed, editorWidthPct]);

  const openPreviewWindow = useCallback((mode: 'window' | 'tab') => {
    if (previewWindowRef.current && !previewWindowRef.current.closed) {
      previewWindowRef.current.focus();
      return;
    }
    const features = mode === 'window' ? 'width=800,height=700,left=200,top=100' : '';
    previewWindowRef.current = window.open('/admin/preview', mode === 'window' ? 'cms-preview' : '_blank', features);
    const checkReady = setInterval(() => {
      if (previewWindowRef.current && !previewWindowRef.current.closed) {
        previewWindowRef.current.postMessage({ type: 'cms-preview-update', data }, '*');
      } else {
        clearInterval(checkReady);
      }
    }, 500);
    setTimeout(() => clearInterval(checkReady), 30000);
  }, [data]);

  const handlePreviewModeChange = useCallback((mode: PreviewMode) => {
    if (mode === 'window' || mode === 'tab') {
      openPreviewWindow(mode);
    }
    setPreviewMode(mode);
  }, [openPreviewWindow]);

  // Floating drag handlers
  const handleFloatMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - floatingPos.x, y: e.clientY - floatingPos.y };
  }, [floatingPos]);

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: MouseEvent) => {
      setFloatingPos({
        x: Math.max(0, e.clientX - dragStart.current.x),
        y: Math.max(0, e.clientY - dragStart.current.y),
      });
    };
    const handleUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging]);

  const showIframe = previewMode === 'side' || previewMode === 'stacked' || previewMode === 'floating';

  // ── Editor Panel ──────────────────────────────────────────────────────
  const editorPanel = (
    <div
      className="w-full flex flex-col min-h-0 overflow-hidden"
      style={{
        borderRight: `1px solid ${C.border}`,
        backgroundColor: C.white,
        borderRadius: '16px 0 0 16px',
        width: isEditorCollapsed ? 0 : `${editorWidthPct}%`,
        minWidth: isEditorCollapsed ? 0 : '280px',
        maxWidth: isEditorCollapsed ? 0 : '600px',
        flexShrink: 0,
        transition: isResizing ? 'none' : 'width 0.25s ease, min-width 0.25s ease',
        overflow: isEditorCollapsed ? 'hidden' : undefined,
      }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-5 py-3.5 shrink-0"
        style={{
          borderBottom: `1px solid ${C.border}`,
          background: `linear-gradient(to bottom, ${C.surface}, ${C.white})`,
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold" style={{ color: C.text }}>
            Editor de Conteúdo
          </span>
          {isDirty && (
            <span
              className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold animate-pulse"
              style={{
                backgroundColor: `${C.warningText}15`,
                color: C.warningText,
                border: `1px solid ${C.warningText}30`,
              }}
            >
              ● Não salvo
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Collapse button */}
          <button
            onClick={handleCollapseToggle}
            className="p-1.5 rounded-lg transition-all duration-150 focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2"
            style={{ color: C.muted, backgroundColor: C.surfaceAlt }}
            title={isEditorCollapsed ? 'Expandir editor' : 'Recolher editor'}
            type="button"
          >
            <PanelLeftClose size={14} />
          </button>
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: C.success }}>
              <CheckCircle2 size={13} />
              Salvo!
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: C.error }}>
              <AlertCircle size={13} />
              Erro ao salvar
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2 active:scale-95"
            style={{
              background: isDirty
                ? `linear-gradient(135deg, ${C.accent} 0%, ${C.accentLight} 100%)`
                : C.inactive,
              color: C.white,
              boxShadow: isDirty ? `0 2px 8px ${C.accent}50` : 'none',
            }}
            type="button"
            aria-label={isDirty ? 'Salvar alterações (Ctrl+S)' : 'Nenhuma alteração para salvar'}
          >
            {isSaving
              ? <Loader2 size={13} className="animate-spin" />
              : <Save size={13} aria-hidden="true" />}
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      {/* Tab switcher – pill style */}
      <div
        className="flex items-center gap-1 shrink-0 px-5 py-2.5"
        role="tablist"
        style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: C.surface }}
      >
        {[
          { id: 'sections' as Tab, label: 'Conteúdo', icon: LayoutPanelLeft },
          { id: 'order' as Tab, label: 'Ordem', icon: Palette },
          { id: 'revisions' as Tab, label: 'Histórico', icon: History },
        ].map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`tabpanel-${t.id}`}
            onClick={() => setTab(t.id)}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2"
            style={{
              backgroundColor: tab === t.id ? C.primary : 'transparent',
              color: tab === t.id ? C.white : C.muted,
              boxShadow: tab === t.id ? `0 2px 6px ${C.primary}30` : 'none',
            }}
            type="button"
          >
            <t.icon size={13} aria-hidden="true" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Scrollable content area */}
      <div
        className="flex-1 overflow-y-auto min-h-0"
        role="tabpanel"
        id={`tabpanel-${tab}`}
        aria-labelledby={`tab-${tab}`}
      >
        {/* ── Aba Conteúdo: acordeões de edição de cada seção ── */}
        {tab === 'sections' && (
          <div>
            {(data.sectionOrder ?? [])
              .filter((sec) => sec.id !== 'navbar' && sec.id !== 'footer')
              .map((sec) => (
                <SectionEditor
                  key={sec.id}
                  sectionKey={sec.id as any}
                  label={sec.label}
                />
              ))}
            {/* Theme editor */}
            <ThemeEditor />
          </div>
        )}

        {/* ── Aba Ordem: reordenar e ativar/desativar seções ── */}
        {tab === 'order' && (
          <div className="px-5 py-5">
            <div className="flex items-center gap-2 mb-4">
              <LayoutPanelLeft size={14} style={{ color: C.accent }} />
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.muted }}>
                Ordem das Seções
              </p>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full ml-auto"
                style={{ backgroundColor: C.surfaceAlt, color: C.muted, border: `1px solid ${C.border}` }}
              >
                {(data.sectionOrder ?? []).length} seções
              </span>
            </div>
            <p className="text-xs mb-4 leading-relaxed" style={{ color: C.muted }}>
              Arraste as setas para reordenar e use o toggle para ativar ou ocultar cada seção da página.
            </p>
            <div className="space-y-2">
              {(data.sectionOrder ?? []).map((sec, i, arr) => (
                <SectionItem
                  key={sec.id}
                  label={sec.label}
                  enabled={sec.enabled}
                  onToggle={() => toggleSectionEnabled(sec.id)}
                  onMoveUp={i > 0 ? () => handleReorder(i, -1) : null}
                  onMoveDown={i < arr.length - 1 ? () => handleReorder(i, 1) : null}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Aba Histórico ── */}
        {tab === 'revisions' && <RevisionHistory />}
      </div>
    </div>
  );

  // ── Preview Panel ────────────────────────────────────────────────────
  const previewPanel = showIframe && (
    <div
      className="flex-1 flex flex-col min-h-0 overflow-hidden"
      style={{
        backgroundColor: C.surfaceAlt,
        borderRadius: isEditorCollapsed ? 16 : '0 16px 16px 0',
        minWidth: 0,
        transition: isResizing ? 'none' : 'border-radius 0.25s ease',
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: C.white }}
      >
        <div className="flex items-center gap-2">
          <Eye size={14} style={{ color: C.accent }} />
          <span className="text-sm font-semibold" style={{ color: C.text }}>
            Visualização ao vivo
          </span>
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: C.success }}
          />
        </div>
        <a
          href="/admin/preview"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs font-medium rounded-md px-2.5 py-1 transition-all"
          style={{
            color: C.accent,
            backgroundColor: `${C.accent}10`,
            border: `1px solid ${C.accent}25`,
          }}
        >
          <ExternalLink size={11} />
          Nova aba
        </a>
      </div>
      <div className="flex-1 relative min-h-0">
        <iframe
          ref={previewIframeRef}
          src="/admin/preview"
          className="absolute inset-0 w-full h-full border-0"
          title="Live preview"
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Cursor override while resizing */}
      {isResizing && (
        <style>{`* { cursor: col-resize !important; user-select: none !important; }`}</style>
      )}

      {/* Main layout */}
      <div
        ref={containerRef}
        className={`flex flex-col lg:flex-row gap-0 overflow-hidden shadow-lg ${
          previewMode === 'stacked' ? '' : 'h-auto lg:h-full'
        }`}
        style={{
          borderRadius: 16,
          border: `1px solid ${C.border}`,
          position: 'relative',
        }}
      >
        {editorPanel}

        {/* ── Drag handle (desktop only) ── */}
        {!isEditorCollapsed && previewMode === 'side' && (
          <div
            className="hidden lg:flex items-center justify-center w-2.5 shrink-0 cursor-col-resize group z-10"
            style={{
              backgroundColor: isResizing ? C.accent : 'transparent',
              transition: 'background-color 0.15s',
              position: 'relative',
            }}
            onMouseDown={handleResizeMouseDown}
            title="Arraste para redimensionar"
          >
            {/* Visual line */}
            <div
              className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px transition-all duration-150"
              style={{
                backgroundColor: isResizing ? C.accent : C.border,
                width: isResizing ? 2 : 1,
              }}
            />
            {/* Grip dots */}
            <div
              className="relative z-10 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            >
              {[0,1,2,3,4].map(i => (
                <div
                  key={i}
                  className="w-1 h-1 rounded-full"
                  style={{ backgroundColor: isResizing ? C.white : C.muted }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Expand tab when editor is collapsed ── */}
        {isEditorCollapsed && previewMode === 'side' && (
          <button
            onClick={handleCollapseToggle}
            className="hidden lg:flex items-center gap-1.5 shrink-0 px-2 py-3 transition-all duration-150 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-g-accent"
            style={{
              background: `linear-gradient(to right, ${C.primary}15, transparent)`,
              borderRight: `2px solid ${C.primary}30`,
              color: C.primary,
              writingMode: 'vertical-rl',
              borderRadius: 0,
            }}
            title="Expandir editor"
            type="button"
          >
            <PanelLeftOpen size={13} />
            <span className="text-[10px] font-semibold mt-1">Editor</span>
          </button>
        )}

        {previewPanel}
      </div>

      {/* Floating preview */}
      {previewMode === 'floating' && (
        <div
          className="fixed z-50 flex flex-col overflow-hidden"
          style={{
            left: floatingPos.x,
            top: floatingPos.y,
            width: floatingSize.w,
            height: floatingSize.h,
            backgroundColor: C.white,
            borderRadius: 12,
            border: `1px solid ${C.border}`,
            boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
          }}
        >
          {/* Drag handle */}
          <div
            className="flex items-center justify-between px-3 py-2.5 shrink-0 cursor-move select-none"
            style={{ background: `linear-gradient(to bottom, ${C.surface}, ${C.white})`, borderBottom: `1px solid ${C.border}` }}
            onMouseDown={handleFloatMouseDown}
          >
            <div className="flex items-center gap-2">
              <GripHorizontal size={13} style={{ color: C.muted }} />
              <span className="text-xs font-medium" style={{ color: C.text }}>Preview flutuante</span>
            </div>
            <button
              onClick={() => setPreviewMode('side')}
              className="p-1.5 rounded-lg transition-colors hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-g-accent"
              style={{ color: C.muted }}
              aria-label="Fechar preview flutuante"
              type="button"
            >
              <X size={13} />
            </button>
          </div>
          <div className="flex-1 relative min-h-0">
            <iframe
              ref={previewIframeRef}
              src="/admin/preview"
              className="absolute inset-0 w-full h-full border-0"
              title="Live preview"
            />
          </div>
        </div>
      )}

      {/* Preview mode selector */}
      <div
        className="flex items-center gap-1 mt-3 p-1.5 rounded-xl"
        style={{
          border: `1px solid ${C.border}`,
          backgroundColor: C.surface,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <Eye size={12} className="ml-1.5 shrink-0" style={{ color: C.muted }} />
        <span className="text-[10px] font-semibold mx-1.5 shrink-0" style={{ color: C.muted }}>
          Preview:
        </span>
        {PREVIEW_MODE_OPTIONS.map(({ mode, label, icon: Icon }) => (
          <button
            key={mode}
            onClick={() => handlePreviewModeChange(mode)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium transition-all duration-150 rounded-lg focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2"
            style={{
              background: previewMode === mode
                ? `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryLight} 100%)`
                : 'transparent',
              color: previewMode === mode ? C.white : C.muted,
              boxShadow: previewMode === mode ? `0 2px 6px ${C.primary}30` : 'none',
            }}
            title={label}
            type="button"
          >
            <Icon size={11} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
