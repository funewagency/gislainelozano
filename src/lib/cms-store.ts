'use client';

import { create } from 'zustand';
import { DEFAULT_CMS_DATA } from './cms-defaults';
import type { GlobalConfig, SectionKey } from './cms-types';

interface Revision {
  version: number;
  data: GlobalConfig;
  summary: string;
  timestamp: string;
  createdBy?: string | null;
}

interface CmsEditorState {
  data: GlobalConfig;
  revisions: Revision[];
  selectedSection: SectionKey | null;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedVersion: number;

  selectSection: (key: SectionKey | null) => void;
  updateSection: (key: SectionKey, patch: Partial<GlobalConfig[SectionKey]>) => void;
  updateField: (key: SectionKey, field: string, value: unknown) => void;
  updateTheme: (field: string, value: unknown) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  toggleSectionEnabled: (sectionId: string) => void;
  save: (editorName: string) => Promise<void>;
  publish: () => Promise<void>;
  revertToRevision: (revision: Revision) => void;
  setServerData: (data: GlobalConfig, revisions: Revision[]) => void;
}

export const useCmsEditor = create<CmsEditorState>((set, get) => ({
  data: DEFAULT_CMS_DATA,
  revisions: [],
  selectedSection: null,
  isDirty: false,
  isSaving: false,
  lastSavedVersion: 1,

  selectSection: (key) => set({ selectedSection: key }),

  updateSection: (key, patch) =>
    set((s) => ({
      data: { ...s.data, [key]: { ...s.data[key], ...patch } },
      isDirty: true,
    })),

  updateField: (key, field, value) =>
    set((s) => {
      const section = s.data[key] as Record<string, unknown>;
      return {
        data: { ...s.data, [key]: { ...section, [field]: value } },
        isDirty: true,
      };
    }),

  updateTheme: (field, value) =>
    set((s) => ({
      data: { ...s.data, theme: { ...s.data.theme, [field]: value } },
      isDirty: true,
    })),

  reorderSections: (fromIndex, toIndex) =>
    set((s) => {
      const order = [...s.data.sectionOrder];
      const [moved] = order.splice(fromIndex, 1);
      order.splice(toIndex, 0, moved);
      return { data: { ...s.data, sectionOrder: order }, isDirty: true };
    }),

  toggleSectionEnabled: (sectionId) =>
    set((s) => ({
      data: {
        ...s.data,
        sectionOrder: s.data.sectionOrder.map((sec) =>
          sec.id === sectionId ? { ...sec, enabled: !sec.enabled } : sec,
        ),
      },
      isDirty: true,
    })),

  save: async (editorName) => {
    const state = get();
    if (!state.isDirty) return;

    set({ isSaving: true });

    const payload = {
      ...state.data,
      meta: {
        ...state.data.meta,
        lastSaved: new Date().toISOString(),
        lastSavedBy: editorName,
        version: state.lastSavedVersion + 1,
      },
    };

    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (attempt > 0) {
          await new Promise((r) => setTimeout(r, 1000 * attempt));
        }

        const res = await fetch('/api/admin/cms', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          if (res.status === 401) throw new Error('Sessão expirada. Faça login novamente.');
          if (res.status === 422) throw new Error(`Dados inválidos: ${body.details?.[0]?.message || 'verifique os campos'}`);
          throw new Error(body.error || `Erro ${res.status}`);
        }

        const { revision } = await res.json();

        set((s) => ({
          data: payload,
          isDirty: false,
          isSaving: false,
          lastSavedVersion: payload.meta.version,
          revisions: [revision, ...s.revisions].slice(0, 100),
        }));

        return;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Falha ao salvar');
        if (attempt < 2) continue;
      }
    }

    set({ isSaving: false });
    throw lastError || new Error('Falha ao salvar após múltiplas tentativas');
  },

  publish: async () => {
    // Publishes current saved state to production
    // For now, same as save since we don't have draft/published separation
    const state = get();
    if (state.isDirty) {
      await state.save(state.data.meta.lastSavedBy ?? 'Admin');
    }
  },

  revertToRevision: (revision) =>
    set((s) => ({
      data: revision.data,
      isDirty: true,
      selectedSection: null,
    })),

  setServerData: (data, revisions) =>
    set({
      data,
      revisions,
      isDirty: false,
      lastSavedVersion: data.meta.version,
    }),
}));
