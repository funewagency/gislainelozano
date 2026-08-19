'use client';

import { useCmsEditor } from '@/lib/cms-store';
import {
  TextField,
  TextAreaField,
  ArrayField,
  RichTextField,
  ImageUploadField,
  ColorField,
  SelectField,
  RangeField,
} from './field-editor';
import { ChevronDown, Palette } from 'lucide-react';
import { C } from '@/components/gislaine/constants';
import { useState, memo } from 'react';
import type { SectionKey, ThemeConfig } from '@/lib/cms-types';
import { DEFAULT_THEME } from '@/lib/cms-defaults';

interface Props {
  sectionKey: SectionKey;
  label: string;
}

// ── Collapsible sub-item card (FAQ, Services, Testimonials) ───────────

function SubItemCard({
  title,
  isOpen,
  onToggle,
  id,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="overflow-hidden transition-all duration-200"
      style={{
        borderRadius: 10,
        border: `1px solid ${isOpen ? C.accent + '40' : C.border}`,
        backgroundColor: isOpen ? `${C.accent}04` : C.white,
        boxShadow: isOpen ? `0 2px 8px ${C.accent}12` : '0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-inset"
        style={{ color: C.text }}
        aria-expanded={isOpen}
        aria-controls={id}
        type="button"
      >
        <span className="text-xs font-semibold truncate pr-2" style={{ color: isOpen ? C.primary : C.text }}>
          {title}
        </span>
        <ChevronDown
          size={13}
          className="shrink-0 transition-transform duration-200"
          style={{
            color: isOpen ? C.accent : C.muted,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
      {isOpen && (
        <div id={id} className="px-3.5 pb-3.5 pt-1 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Section accordion wrapper ─────────────────────────────────────────

export const SectionEditor = memo(function SectionEditor(raw: Props) {
  const { sectionKey, label } = raw ?? {};
  const data = useCmsEditor(s => s.data);
  const selectedSection = useCmsEditor(s => s.selectedSection);
  const selectSection = useCmsEditor(s => s.selectSection);
  const updateField = useCmsEditor(s => s.updateField);
  const updateSection = useCmsEditor(s => s.updateSection);
  const isOpen = selectedSection === sectionKey;
  const section = data[sectionKey] as Record<string, unknown>;

  if (!section) return null;

  return (
    <div
      className="transition-all duration-150"
      style={{ borderBottom: `1px solid ${C.border}` }}
    >
      <button
        onClick={() => selectSection(isOpen ? null : sectionKey)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left transition-all duration-150 focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-inset group"
        style={{
          backgroundColor: isOpen ? `${C.accent}06` : 'transparent',
        }}
        aria-expanded={isOpen}
        aria-controls={`section-${sectionKey}-content`}
        type="button"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Color dot indicator */}
          <span
            className="w-2 h-2 rounded-full shrink-0 transition-all duration-200"
            style={{
              backgroundColor: isOpen ? C.accent : C.border,
              boxShadow: isOpen ? `0 0 0 3px ${C.accent}20` : 'none',
            }}
          />
          <span
            className="font-semibold text-sm transition-colors"
            style={{ color: isOpen ? C.primary : C.text }}
          >
            {label}
          </span>
        </div>

        <ChevronDown
          size={15}
          className="shrink-0 transition-transform duration-250"
          style={{
            color: isOpen ? C.accent : C.muted,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {isOpen && (
        <div
          id={`section-${sectionKey}-content`}
          className="px-5 pb-6 pt-3 space-y-5"
          style={{ backgroundColor: `${C.surfaceAlt}40` }}
        >
          <SectionFields
            sectionKey={sectionKey}
            section={section}
            updateField={updateField}
            updateSection={updateSection}
          />
        </div>
      )}
    </div>
  );
});

// ── Testimonials ──────────────────────────────────────────────────────

function TestimonialsEditor({ section, sectionKey, updateField }: any) {
  if (!section) return null;
  const items: any[] = section.items ?? [];
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const title = section.titleHtml ?? section.title ?? '';
  const eyebrow = section.eyebrow ?? '';
  const description = section.description ?? '';

  return (
    <>
      <TextField label="Chapéu" value={eyebrow} onChange={(v) => updateField(sectionKey, 'eyebrow', v)} />
      <RichTextField label="Título" value={title} onChange={(v) => updateField(sectionKey, 'titleHtml', v)} />
      <TextAreaField label="Descrição" value={description} onChange={(v) => updateField(sectionKey, 'description', v)} />

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.muted }}>
          Depoimentos ({items.length})
        </label>
        <div className="space-y-2">
          {items.map((item: any, i: number) => (
            <SubItemCard
              key={item.id}
              title={item.name || `Depoimento ${i + 1}`}
              isOpen={!!expanded[item.id]}
              onToggle={() => setExpanded((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
              id={`testimonial-${item.id}-content`}
            >
              <TextField label="Nome" value={item.name} onChange={(v) => {
                const next = [...items]; next[i] = { ...next[i], name: v }; updateField(sectionKey, 'items', next);
              }} />
              <TextField label="Cargo/Empresa" value={item.role || ''} onChange={(v) => {
                const next = [...items]; next[i] = { ...next[i], role: v }; updateField(sectionKey, 'items', next);
              }} />
              <ArrayField label="Parágrafos" items={item.paragraphs.map((p: any) => p.text)} onChange={(v) => {
                const next = [...items];
                next[i] = { ...next[i], paragraphs: v.map((text: string, j: number) => ({ id: `tp-${i}-${j}`, text })) };
                updateField(sectionKey, 'items', next);
              }} />
            </SubItemCard>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Positioning ───────────────────────────────────────────────────────

function PositioningEditor({ section, sectionKey, updateField }: any) {
  if (!section) return null;
  return (
    <>
      <TextField label="Chapéu" value={section.eyebrow || ''} onChange={(v) => updateField(sectionKey, 'eyebrow', v)} />
      <RichTextField label="Título" value={section.titleHtml || ''} onChange={(v) => updateField(sectionKey, 'titleHtml', v)} />
      <TextAreaField label="Parágrafo 1" value={section.paragraph1 || ''} onChange={(v) => updateField(sectionKey, 'paragraph1', v)} />
      <TextField label="Texto de Destaque" value={section.emphasisText || ''} onChange={(v) => updateField(sectionKey, 'emphasisText', v)} />
      <TextAreaField label="Parágrafo 2" value={section.paragraph2 || ''} onChange={(v) => updateField(sectionKey, 'paragraph2', v)} />
    </>
  );
}

// ── Bio ───────────────────────────────────────────────────────────────

function BioEditor({ section, sectionKey, updateField }: any) {
  if (!section) return null;
  const paragraphs: string[] = section.paragraphs ?? [];
  const careerPath: string[] = section.careerPath ?? [];
  return (
    <>
      <TextField label="Chapéu" value={section.eyebrow || ''} onChange={(v) => updateField(sectionKey, 'eyebrow', v)} />
      <RichTextField label="Título" value={section.titleHtml || ''} onChange={(v) => updateField(sectionKey, 'titleHtml', v)} />
      <ArrayField label="Parágrafos" items={paragraphs} onChange={(v) => updateField(sectionKey, 'paragraphs', v)} maxItems={10} placeholder="Parágrafo" />
      <ImageUploadField label="Foto" value={section.portraitImageUrl || ''} onChange={(v) => updateField(sectionKey, 'portraitImageUrl', v)} />
      <ArrayField label="Trajetória Profissional" items={careerPath} onChange={(v) => updateField(sectionKey, 'careerPath', v)} maxItems={10} placeholder="Item da trajetória" />
      <TextField label="Nome (Overlay)" value={section.overlayName || ''} onChange={(v) => updateField(sectionKey, 'overlayName', v)} />
      <TextField label="Cargo (Overlay)" value={section.overlayRole || ''} onChange={(v) => updateField(sectionKey, 'overlayRole', v)} />
    </>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────

function FaqEditor({ section, sectionKey, updateField }: any) {
  if (!section) return null;
  const items: any[] = section.items ?? [];
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const title = section.titleHtml ?? section.title ?? '';
  const eyebrow = section.eyebrow ?? '';

  return (
    <>
      <TextField label="Chapéu" value={eyebrow} onChange={(v) => updateField(sectionKey, 'eyebrow', v)} />
      <RichTextField label="Título" value={title} onChange={(v) => updateField(sectionKey, 'titleHtml', v)} />
      <TextAreaField label="Pergunta do CTA no Rodapé" value={section.footerCtaQuestion || ''} onChange={(v) => updateField(sectionKey, 'footerCtaQuestion', v)} />
      <TextField label="Texto do Botão CTA" value={section.footerCtaButtonText || ''} onChange={(v) => updateField(sectionKey, 'footerCtaButtonText', v)} />

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.muted }}>
          Perguntas ({items.length})
        </label>
        <div className="space-y-2">
          {items.map((item: any, i: number) => (
            <SubItemCard
              key={item.id}
              title={item.question || `Pergunta ${i + 1}`}
              isOpen={!!expanded[item.id]}
              onToggle={() => setExpanded((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
              id={`faq-${item.id}-content`}
            >
              <TextField label="Pergunta" value={item.question} onChange={(v) => {
                const next = [...items]; next[i] = { ...next[i], question: v }; updateField(sectionKey, 'items', next);
              }} />
              <RichTextField label="Resposta" value={item.answerHtml || item.answer || ''} onChange={(v) => {
                const next = [...items]; next[i] = { ...next[i], answerHtml: v, answer: v }; updateField(sectionKey, 'items', next);
              }} />
            </SubItemCard>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────

function HeroEditor({ section, sectionKey, updateField }: any) {
  if (!section) return null;
  return (
    <>
      <RichTextField label="Título" value={section.titleHtml || ''} onChange={(v) => updateField(sectionKey, 'titleHtml', v)} />
      <TextAreaField label="Descrição" value={section.description || ''} onChange={(v) => updateField(sectionKey, 'description', v)} />
      <TextField label="Texto do CTA" value={section.ctaText || ''} onChange={(v) => updateField(sectionKey, 'ctaText', v)} />
      <TextField label="Label do Scroll" value={section.scrollLabel || ''} onChange={(v) => updateField(sectionKey, 'scrollLabel', v)} />
      <ImageUploadField label="Imagem Mobile" value={section.mobileImageUrl || ''} onChange={(v) => updateField(sectionKey, 'mobileImageUrl', v)} />
      <ImageUploadField label="Imagem Desktop" value={section.desktopImageUrl || ''} onChange={(v) => updateField(sectionKey, 'desktopImageUrl', v)} />
    </>
  );
}

// ── Pain Points ───────────────────────────────────────────────────────

function PainPointsEditor({ section, sectionKey, updateField }: any) {
  if (!section) return null;
  const bullets: string[] = section.bullets ?? [];
  return (
    <>
      <TextField label="Chapéu" value={section.eyebrow || ''} onChange={(v) => updateField(sectionKey, 'eyebrow', v)} />
      <ArrayField label="Bullets" items={bullets} onChange={(v) => updateField(sectionKey, 'bullets', v)} maxItems={8} placeholder="Item da lista" />
      <TextAreaField label="Texto de Callout" value={section.calloutText || ''} onChange={(v) => updateField(sectionKey, 'calloutText', v)} />
      <TextField label="Destaque do Callout" value={section.calloutEmphasis || ''} onChange={(v) => updateField(sectionKey, 'calloutEmphasis', v)} />
    </>
  );
}

// ── Section Fields dispatcher ─────────────────────────────────────────

function SectionFields({ sectionKey, section, updateField, updateSection }: any) {
  if (!section) return null;
  const title = section.titleHtml ?? section.title ?? '';
  const eyebrow = section.eyebrow ?? '';
  const description = section.description ?? '';
  switch (sectionKey) {
    case 'hero': return <HeroEditor section={section} sectionKey={sectionKey} updateField={updateField} />;
    case 'painPoints': return <PainPointsEditor section={section} sectionKey={sectionKey} updateField={updateField} />;
    case 'services': return <ServicesEditor section={section} sectionKey={sectionKey} updateField={updateField} />;
    case 'testimonials': return <TestimonialsEditor section={section} sectionKey={sectionKey} updateField={updateField} />;
    case 'faq': return <FaqEditor section={section} sectionKey={sectionKey} updateField={updateField} />;
    case 'whatsappModal': return <WhatsAppModalEditor section={section} sectionKey={sectionKey} updateField={updateField} />;
    case 'positioning': return <PositioningEditor section={section} sectionKey={sectionKey} updateField={updateField} />;
    case 'bio': return <BioEditor section={section} sectionKey={sectionKey} updateField={updateField} />;
    default: return (
      <>
        <TextField label="Chapéu" value={eyebrow} onChange={(v) => updateField(sectionKey, 'eyebrow', v)} />
        <RichTextField label="Título" value={title} onChange={(v) => updateField(sectionKey, 'titleHtml', v)} />
        <TextAreaField label="Descrição" value={description} onChange={(v) => updateField(sectionKey, 'description', v)} />
      </>
    );
  }
}

// ── Services ──────────────────────────────────────────────────────────

function ServicesEditor({ section, sectionKey, updateField }: any) {
  if (!section) return null;
  const items: any[] = section.items ?? [];
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const title = section.titleHtml ?? section.title ?? '';
  const eyebrow = section.eyebrow ?? '';

  return (
    <>
      <TextField label="Chapéu" value={eyebrow} onChange={(v) => updateField(sectionKey, 'eyebrow', v)} />
      <RichTextField label="Título" value={title} onChange={(v) => updateField(sectionKey, 'titleHtml', v)} />

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.muted }}>
          Serviços ({items.length})
        </label>
        <div className="space-y-2">
          {items.map((item: any, i: number) => (
            <SubItemCard
              key={item.id}
              title={`${item.number ? item.number + '. ' : ''}${item.title || `Serviço ${i + 1}`}`}
              isOpen={!!expanded[item.id]}
              onToggle={() => setExpanded((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
              id={`service-${item.id}-content`}
            >
              <TextField label="Título" value={item.title} onChange={(v) => {
                const next = [...items]; next[i] = { ...next[i], title: v }; updateField(sectionKey, 'items', next);
              }} />
              <TextField label="Subtítulo" value={item.subtitle || ''} onChange={(v) => {
                const next = [...items]; next[i] = { ...next[i], subtitle: v }; updateField(sectionKey, 'items', next);
              }} />
              <RichTextField label="Descrição" value={item.descriptionHtml || item.description || ''} onChange={(v) => {
                const next = [...items]; next[i] = { ...next[i], descriptionHtml: v, description: v }; updateField(sectionKey, 'items', next);
              }} />
              <TextField label="Texto do CTA" value={item.ctaText} onChange={(v) => {
                const next = [...items]; next[i] = { ...next[i], ctaText: v }; updateField(sectionKey, 'items', next);
              }} />
            </SubItemCard>
          ))}
        </div>
      </div>
    </>
  );
}

// ── WhatsApp Modal ────────────────────────────────────────────────────

function WhatsAppModalEditor({ section, sectionKey, updateField }: any) {
  if (!section) return null;
  const triggerDelay = section.triggerDelay ?? 5000;
  const showOnExitIntent = section.showOnExitIntent ?? false;
  return (
    <>
      <TextField label="Título do Modal" value={section.title || ''} onChange={(v) => updateField(sectionKey, 'title', v)} />
      <TextAreaField label="Mensagem do Modal" value={section.message || ''} onChange={(v) => updateField(sectionKey, 'message', v)} />
      <TextField label="Texto do Botão" value={section.buttonText || ''} onChange={(v) => updateField(sectionKey, 'buttonText', v)} />
      <TextField label="Número WhatsApp (apenas números)" value={section.phoneNumber || ''} onChange={(v) => updateField(sectionKey, 'phoneNumber', v)} />
      <RangeField label="Atraso para abrir (ms)" value={triggerDelay} onChange={(v) => updateField(sectionKey, 'triggerDelay', v)} min={0} max={60000} step={1000} suffix="ms" />
      <div
        className="flex items-center justify-between p-3 rounded-xl"
        style={{ backgroundColor: C.surfaceAlt, border: `1px solid ${C.border}` }}
      >
        <label htmlFor={`${sectionKey}-exit-intent`} className="text-xs font-medium" style={{ color: C.text }}>
          Mostrar na intenção de saída
        </label>
        <input
          id={`${sectionKey}-exit-intent`}
          type="checkbox"
          checked={showOnExitIntent}
          onChange={(e) => updateField(sectionKey, 'showOnExitIntent', e.target.checked)}
          className="w-4 h-4 cursor-pointer"
          style={{ accentColor: C.accent }}
        />
      </div>
    </>
  );
}

// ── Theme Editor ──────────────────────────────────────────────────────

const FONT_OPTIONS = [
  { label: 'Outfit', value: 'Outfit, sans-serif' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Playfair Display', value: 'Playfair Display, serif' },
  { label: 'DM Sans', value: 'DM Sans, sans-serif' },
  { label: 'Space Grotesk', value: 'Space Grotesk, sans-serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Lora', value: 'Lora, serif' },
  { label: 'Poppins', value: 'Poppins, sans-serif' },
];

export const ThemeEditor = memo(function ThemeEditor() {
  const data = useCmsEditor(s => s.data);
  const updateTheme = useCmsEditor(s => s.updateTheme);
  const [isOpen, setIsOpen] = useState(false);
  const theme = (data?.theme ?? DEFAULT_THEME) as ThemeConfig;

  return (
    <div
      className="transition-all duration-150"
      style={{ borderTop: `1px solid ${C.border}` }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left transition-all duration-150 focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-inset"
        style={{ backgroundColor: isOpen ? `${C.primary}06` : 'transparent' }}
        aria-expanded={isOpen}
        aria-controls="theme-editor-content"
        type="button"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span
            className="w-2 h-2 rounded-full shrink-0 transition-all duration-200"
            style={{
              backgroundColor: isOpen ? C.accent : C.border,
              boxShadow: isOpen ? `0 0 0 3px ${C.accent}20` : 'none',
            }}
          />
          <Palette size={14} style={{ color: isOpen ? C.accent : C.muted }} className="shrink-0" />
          <span className="font-semibold text-sm" style={{ color: isOpen ? C.primary : C.text }}>
            Tema Visual
          </span>
        </div>
        <ChevronDown
          size={15}
          className="shrink-0 transition-transform duration-250"
          style={{
            color: isOpen ? C.accent : C.muted,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {isOpen && (
        <div
          id="theme-editor-content"
          className="px-5 pb-6 pt-3 space-y-5"
          style={{ backgroundColor: `${C.surfaceAlt}40` }}
        >
          {/* Colors group */}
          <div
            className="p-4 rounded-xl space-y-4"
            style={{ backgroundColor: C.white, border: `1px solid ${C.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.muted }}>
              Cores
            </p>
            <ColorField label="Cor Primária" value={theme.primaryColor} onChange={(v) => updateTheme('primaryColor', v)} />
            <ColorField label="Cor de Destaque" value={theme.accentColor} onChange={(v) => updateTheme('accentColor', v)} />
            <ColorField label="Cor de Fundo" value={theme.backgroundColor} onChange={(v) => updateTheme('backgroundColor', v)} />
            <ColorField label="Cor de Superfície" value={theme.surfaceColor} onChange={(v) => updateTheme('surfaceColor', v)} />
            <ColorField label="Cor do Texto" value={theme.textColor} onChange={(v) => updateTheme('textColor', v)} />
            <ColorField label="Cor Suave" value={theme.mutedColor} onChange={(v) => updateTheme('mutedColor', v)} />
          </div>

          {/* Typography group */}
          <div
            className="p-4 rounded-xl space-y-4"
            style={{ backgroundColor: C.white, border: `1px solid ${C.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.muted }}>
              Tipografia
            </p>
            <SelectField label="Fonte de Títulos" value={theme.headingFont} onChange={(v) => updateTheme('headingFont', v)} options={FONT_OPTIONS} />
            <SelectField label="Fonte do Corpo" value={theme.bodyFont} onChange={(v) => updateTheme('bodyFont', v)} options={FONT_OPTIONS} />
            <RangeField label="Tamanho Base (px)" value={theme.baseFontSize} onChange={(v) => updateTheme('baseFontSize', v)} min={14} max={24} step={1} suffix="px" />
            <RangeField label="Espaçamento Títulos" value={theme.headingLetterSpacing} onChange={(v) => updateTheme('headingLetterSpacing', v)} min={-2} max={6} step={0.5} suffix="px" />
            <RangeField label="Altura da Linha" value={theme.bodyLineHeight} onChange={(v) => updateTheme('bodyLineHeight', v)} min={1.2} max={2} step={0.1} />
          </div>

          {/* Spacing group */}
          <div
            className="p-4 rounded-xl space-y-4"
            style={{ backgroundColor: C.white, border: `1px solid ${C.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.muted }}>
              Espaçamento e Bordas
            </p>
            <RangeField label="Padding das Seções (px)" value={theme.sectionPadding} onChange={(v) => updateTheme('sectionPadding', v)} min={16} max={120} step={8} suffix="px" />
            <RangeField label="Raio do Card (px)" value={theme.cardBorderRadius} onChange={(v) => updateTheme('cardBorderRadius', v)} min={0} max={32} step={2} suffix="px" />
            <RangeField label="Raio do Botão (px)" value={theme.buttonBorderRadius} onChange={(v) => updateTheme('buttonBorderRadius', v)} min={0} max={32} step={2} suffix="px" />
          </div>
        </div>
      )}
    </div>
  );
});
