'use client';

import { useState, useEffect, useRef, useId, memo } from 'react';
import { C } from '@/components/gislaine/constants';
import { Upload, Image as ImageIcon, X, Plus, Trash2 } from 'lucide-react';

// ── Shared input styles ──────────────────────────────────────────────

const inputBase: React.CSSProperties = {
  border: `1.5px solid ${C.border}`,
  color: C.text,
  backgroundColor: C.white,
  borderRadius: 10,
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

// ── FieldWrapper ─────────────────────────────────────────────────────

function FieldWrapper(raw: { label?: string; hint?: string; children: React.ReactNode; fieldId?: string }) {
  const { label = '', hint, children, fieldId } = raw ?? {};
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: C.muted }}
          htmlFor={fieldId}
        >
          {label}
        </label>
        {hint && (
          <span
            className="text-[10px] px-2 py-0.5 rounded-full"
            style={{ color: C.placeholder, backgroundColor: C.surfaceAlt }}
          >
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// ── Shared focus handler hook ────────────────────────────────────────

function useFocusStyle(borderColor = C.accent) {
  const [focused, setFocused] = useState(false);
  const focusStyle: React.CSSProperties = focused
    ? { borderColor, boxShadow: `0 0 0 3px ${borderColor}20` }
    : {};
  return { focused, setFocused, focusStyle };
}

// ── TextField ────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  maxLength?: number;
}

export const TextField = memo(function TextField(raw: FieldProps) {
  const { label = '', value = '', onChange = () => {}, placeholder, hint, maxLength } = raw ?? {};
  const id = useId();
  const { setFocused, focusStyle } = useFocusStyle();
  return (
    <FieldWrapper label={label} hint={hint} fieldId={id}>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full px-3.5 py-2.5 text-sm transition-all"
        style={{ ...inputBase, ...focusStyle }}
      />
    </FieldWrapper>
  );
});

// ── TextAreaField ────────────────────────────────────────────────────

export const TextAreaField = memo(function TextAreaField(raw: FieldProps) {
  const { label = '', value = '', onChange = () => {}, placeholder, hint, maxLength } = raw ?? {};
  const id = useId();
  const { setFocused, focusStyle } = useFocusStyle();
  return (
    <FieldWrapper label={label} hint={hint} fieldId={id}>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={4}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full px-3.5 py-2.5 text-sm transition-all resize-y"
        style={{ ...inputBase, ...focusStyle }}
      />
    </FieldWrapper>
  );
});

// ── ArrayField ───────────────────────────────────────────────────────

interface ArrayFieldProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  maxItems?: number;
  placeholder?: string;
}

export const ArrayField = memo(function ArrayField(raw: ArrayFieldProps) {
  const { label = '', items = [], onChange = () => {}, maxItems = 10, placeholder } = raw ?? {};
  const id = useId();
  return (
    <FieldWrapper label={label} hint={(items?.length ?? 0) >= maxItems ? `Máx ${maxItems}` : undefined} fieldId={id}>
      <div className="space-y-2">
        {(items ?? []).map((item, i) => (
          <ArrayItem
            key={`${id}-${i}`}
            index={i}
            value={item}
            placeholder={placeholder}
            onEdit={(v) => {
              const next = [...(items ?? [])];
              next[i] = v;
              onChange(next);
            }}
            onRemove={() => onChange((items ?? []).filter((_, j) => j !== i))}
          />
        ))}

        {(items?.length ?? 0) < maxItems && (
          <button
            onClick={() => onChange([...(items ?? []), ''])}
            className="flex items-center gap-2 w-full px-3.5 py-2 text-xs font-semibold rounded-xl transition-all duration-150 focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2 hover:scale-[1.01] active:scale-[0.99]"
            style={{
              color: C.accent,
              border: `1.5px dashed ${C.accent}50`,
              backgroundColor: `${C.accent}06`,
              borderRadius: 10,
            }}
            type="button"
          >
            <Plus size={13} />
            Adicionar item
          </button>
        )}
      </div>
    </FieldWrapper>
  );
});

function ArrayItem({
  index,
  value,
  placeholder,
  onEdit,
  onRemove,
}: {
  index: number;
  value: string;
  placeholder?: string;
  onEdit: (v: string) => void;
  onRemove: () => void;
}) {
  const { setFocused, focusStyle } = useFocusStyle();
  return (
    <div className="flex items-center gap-2">
      <span
        className="text-[10px] font-bold shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
        style={{ backgroundColor: C.surfaceAlt, color: C.muted }}
      >
        {index + 1}
      </span>
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onEdit(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="flex-1 px-3 py-2 text-sm transition-all"
        style={{ ...inputBase, ...focusStyle }}
      />
      <button
        onClick={onRemove}
        className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:scale-110 focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2"
        style={{ color: C.error, backgroundColor: `${C.error}10` }}
        aria-label={`Remover item ${index + 1}`}
        type="button"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

// ── ToggleField ──────────────────────────────────────────────────────

interface ToggleFieldProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export const ToggleField = memo(function ToggleField(raw: ToggleFieldProps) {
  const { label = '', value = false, onChange = () => {} } = raw ?? {};
  return (
    <div
      className="flex items-center justify-between px-3.5 py-3 rounded-xl"
      style={{ backgroundColor: C.surfaceAlt, border: `1px solid ${C.border}` }}
    >
      <span className="text-xs font-medium" style={{ color: C.text }}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        role="switch"
        aria-checked={value}
        className="relative w-10 h-5.5 flex items-center rounded-full transition-all duration-200 focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2"
        style={{
          backgroundColor: value ? C.accent : C.inactive,
          width: 40,
          height: 22,
          boxShadow: value ? `0 0 0 3px ${C.accent}20` : 'none',
        }}
        aria-label={label}
        type="button"
      >
        <div
          className="absolute w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200"
          style={{ left: value ? 22 : 3 }}
        />
      </button>
    </div>
  );
});

// ── ColorField ───────────────────────────────────────────────────────

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export const ColorField = memo(function ColorField(raw: ColorFieldProps) {
  const { label = '', value = '', onChange = () => {} } = raw ?? {};
  const id = useId();
  const { setFocused, focusStyle } = useFocusStyle();

  return (
    <FieldWrapper label={label} fieldId={id}>
      <div className="flex items-center gap-2.5">
        {/* Color swatch */}
        <div className="relative shrink-0">
          <input
            id={id}
            type="color"
            value={value || C.text}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            tabIndex={-1}
          />
          <div
            className="w-10 h-10 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 shadow-sm"
            style={{
              backgroundColor: value || C.text,
              borderColor: C.border,
            }}
          />
        </div>

        {/* Hex text input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 px-3.5 py-2.5 text-sm font-mono transition-all"
          style={{ ...inputBase, ...focusStyle }}
        />

        {/* Live preview label */}
        {value && (
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-mono shrink-0"
            style={{ backgroundColor: value, color: getContrastColor(value), fontSize: 9 }}
          >
            Aa
          </span>
        )}
      </div>
    </FieldWrapper>
  );
});

/** Returns black or white based on background luminance */
function getContrastColor(hex: string): string {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  } catch {
    return '#ffffff';
  }
}

// ── SelectField ──────────────────────────────────────────────────────

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
}

export const SelectField = memo(function SelectField(raw: SelectFieldProps) {
  const { label = '', value = '', onChange = () => {}, options = [], placeholder } = raw ?? {};
  const id = useId();
  const { setFocused, focusStyle } = useFocusStyle();

  return (
    <FieldWrapper label={label} fieldId={id}>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full px-3.5 py-2.5 text-sm transition-all appearance-none pr-9"
          style={{ ...inputBase, ...focusStyle, cursor: 'pointer' }}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {(options ?? []).map((opt) => {
            if (!opt) return null;
            return <option key={opt.value} value={opt.value}>{opt.label}</option>;
          })}
        </select>
        {/* Custom chevron */}
        <div
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
          style={{ color: C.muted }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4.5L6 8.5L10 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </FieldWrapper>
  );
});

// ── RangeField ───────────────────────────────────────────────────────

interface RangeFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

export const RangeField = memo(function RangeField(raw: RangeFieldProps) {
  const { label = '', value = 0, onChange = () => {}, min = 0, max = 100, step = 1, suffix = '' } = raw ?? {};
  const id = useId();
  const pct = Math.round(((value - min) / (max - min)) * 100);

  return (
    <FieldWrapper label={label} fieldId={id}>
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            id={id}
            type="range"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            min={min}
            max={max}
            step={step}
            className="w-full h-1.5 cursor-pointer appearance-none rounded-full"
            style={{
              background: `linear-gradient(to right, ${C.accent} 0%, ${C.accent} ${pct}%, ${C.border} ${pct}%, ${C.border} 100%)`,
              accentColor: C.accent,
            }}
          />
        </div>
        <span
          className="text-xs font-semibold font-mono min-w-[3.5rem] text-right px-2.5 py-1 rounded-lg"
          style={{ color: C.text, backgroundColor: C.surfaceAlt, border: `1px solid ${C.border}` }}
        >
          {value}{suffix}
        </span>
      </div>
    </FieldWrapper>
  );
});

// ── ImageUploadField ─────────────────────────────────────────────────

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export const ImageUploadField = memo(function ImageUploadField(raw: ImageUploadFieldProps) {
  const { label = '', value = '', onChange = () => {} } = raw ?? {};
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showGallery, setShowGallery] = useState(false);
  const id = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setFocused, focusStyle } = useFocusStyle();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }
      const { url } = await res.json();
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    onChange(url);
    setError('');
  };

  return (
    <FieldWrapper label={label} fieldId={id}>
      <div className="space-y-2.5">
        {/* Image preview with overlay actions */}
        {value ? (
          <div
            className="relative w-full h-36 overflow-hidden rounded-xl group"
            style={{ backgroundColor: C.surfaceAlt, border: `1.5px solid ${C.border}` }}
          >
            <img src={value} alt="" className="w-full h-full object-contain" loading="lazy" />
            {/* Overlay on hover */}
            <div
              className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
                style={{ backgroundColor: C.white, color: C.primary }}
              >
                <Upload size={11} />
                Trocar
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
                style={{ backgroundColor: C.error, color: C.white }}
              >
                <Trash2 size={11} />
                Remover
              </button>
            </div>
          </div>
        ) : (
          /* Empty state – dropzone style */
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-24 flex flex-col items-center justify-center gap-2 rounded-xl transition-all duration-150 hover:scale-[1.01] active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-g-accent"
            style={{
              border: `2px dashed ${C.border}`,
              backgroundColor: C.surfaceAlt,
              color: C.muted,
            }}
          >
            <ImageIcon size={20} style={{ color: C.muted }} />
            <span className="text-xs font-medium">Clique para fazer upload</span>
          </button>
        )}

        {/* URL input */}
        <div className="flex items-center gap-2">
          <input
            id={id}
            type="text"
            value={value}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="/uploads/... ou https://..."
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="flex-1 px-3.5 py-2 text-xs font-mono transition-all"
            style={{ ...inputBase, ...focusStyle }}
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              color: C.white,
              background: uploading
                ? C.inactive
                : `linear-gradient(135deg, ${C.accent} 0%, ${C.accentLight} 100%)`,
              boxShadow: uploading ? 'none' : `0 2px 8px ${C.accent}40`,
            }}
          >
            {uploading ? (
              <><Upload size={11} className="animate-pulse" aria-hidden="true" /> Enviando...</>
            ) : (
              <><Upload size={11} aria-hidden="true" /> Upload</>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            onChange={handleFileUpload}
            className="sr-only"
            disabled={uploading}
            aria-label="Selecionar imagem"
          />

          <button
            onClick={() => setShowGallery(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all duration-150 focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2 hover:scale-[1.02]"
            style={{
              color: C.accent,
              border: `1.5px solid ${C.accent}40`,
              backgroundColor: `${C.accent}08`,
            }}
            type="button"
          >
            <ImageIcon size={11} aria-hidden="true" />
            Galeria
          </button>
        </div>

        {error && (
          <p
            className="text-xs px-3 py-2 rounded-lg"
            style={{ color: C.error, backgroundColor: `${C.error}10`, border: `1px solid ${C.error}25` }}
          >
            {error}
          </p>
        )}
      </div>

      {showGallery && (
        <ImageGallery
          onSelect={(url) => { onChange(url); setShowGallery(false); }}
          onClose={() => setShowGallery(false)}
        />
      )}
    </FieldWrapper>
  );
});

// ── ImageGallery ─────────────────────────────────────────────────────

interface ImageGalleryProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

function ImageGallery(raw: ImageGalleryProps) {
  const { onSelect, onClose } = raw ?? {};
  const [images, setImages] = useState<{ url: string; name: string; size: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const abort = new AbortController();
    fetch('/api/admin/images', { signal: abort.signal })
      .then((r) => r.json())
      .then((data) => setImages(data.images || []))
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => abort.abort();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCloseRef.current(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    focusable[0]?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const f = el.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1]?.focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0]?.focus(); }
    };
    el.addEventListener('keydown', trap);
    return () => el.removeEventListener('keydown', trap);
  }, []);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gallery-title"
    >
      <div
        className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col mx-4"
        style={{
          backgroundColor: C.white,
          borderRadius: 16,
          boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
          border: `1px solid ${C.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: `1px solid ${C.border}`, background: `linear-gradient(to bottom, ${C.surface}, ${C.white})` }}
        >
          <div className="flex items-center gap-2.5">
            <ImageIcon size={16} style={{ color: C.accent }} />
            <h3 id="gallery-title" className="text-sm font-bold" style={{ color: C.primary }}>
              Galeria de Imagens
            </h3>
            {!loading && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ backgroundColor: C.surfaceAlt, color: C.muted }}
              >
                {images.length} imagens
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-all hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2"
            style={{ color: C.muted }}
            aria-label="Fechar"
            type="button"
          >
            <X size={15} />
          </button>
        </div>

        {/* Gallery grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl animate-pulse"
                  style={{ backgroundColor: C.surfaceAlt }}
                />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ImageIcon size={32} style={{ color: C.border }} className="mb-3" />
              <p className="text-sm font-medium" style={{ color: C.muted }}>Nenhuma imagem enviada ainda</p>
              <p className="text-xs mt-1" style={{ color: C.placeholder }}>Faça upload na seção acima</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {images.map((img) => (
                <button
                  key={img.url}
                  onClick={() => { setSelected(img.url); onSelect(img.url); }}
                  className="aspect-square overflow-hidden rounded-xl transition-all duration-150 hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2 active:scale-[0.97]"
                  style={{
                    border: `2px solid ${selected === img.url ? C.accent : C.border}`,
                    backgroundColor: C.surfaceAlt,
                    boxShadow: selected === img.url ? `0 0 0 3px ${C.accent}25` : '0 1px 3px rgba(0,0,0,0.08)',
                  }}
                  type="button"
                  aria-label={`Selecionar ${img.name}`}
                >
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── RichTextField (Lexical) ──────────────────────────────────────────

import nextDynamic from 'next/dynamic';

const LexicalRichTextField = nextDynamic(
  () => import('./rich-text-lexical').then((m) => m.LexicalRichTextField),
  {
    ssr: false,
    loading: () => (
      <div className="h-32 rounded-xl animate-pulse" style={{ backgroundColor: C.surfaceAlt, border: `1.5px solid ${C.border}` }} />
    ),
  }
);

export function RichTextField(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return <LexicalRichTextField {...props} />;
}
