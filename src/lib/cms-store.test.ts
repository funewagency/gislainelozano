import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCmsEditor } from './cms-store';
import { DEFAULT_CMS_DATA, DEFAULT_THEME } from './cms-defaults';
import type { GlobalConfig } from './cms-types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Revision {
  version: number;
  data: GlobalConfig;
  summary: string;
  timestamp: string;
  createdBy?: string | null;
}

// ---------------------------------------------------------------------------
// Shared test data
// ---------------------------------------------------------------------------

const mockRevision: Revision = {
  version: 99,
  data: DEFAULT_CMS_DATA,
  summary: 'Test revision',
  timestamp: '2025-06-01T12:00:00.000Z',
  createdBy: 'Tester',
};

const mockRevisions: Revision[] = [
  { version: 3, data: DEFAULT_CMS_DATA, summary: 'v3', timestamp: '2025-06-03T12:00:00.000Z' },
  { version: 2, data: DEFAULT_CMS_DATA, summary: 'v2', timestamp: '2025-06-02T12:00:00.000Z' },
  { version: 1, data: DEFAULT_CMS_DATA, summary: 'v1', timestamp: '2025-06-01T12:00:00.000Z' },
];

const serverData: GlobalConfig = {
  ...DEFAULT_CMS_DATA,
  meta: { lastSaved: '2025-06-10T08:00:00.000Z', lastSavedBy: 'Admin', version: 7 },
  hero: { ...DEFAULT_CMS_DATA.hero, ctaText: 'Server version CTA' },
};

// ---------------------------------------------------------------------------
// Mock fetch
// ---------------------------------------------------------------------------

const mockFetch = vi.fn();

function createOkResponse(revision?: Revision): Response {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve({ revision: revision ?? mockRevision }),
  } as Response;
}

function createErrorResponse(status: number, body: Record<string, unknown> = {}): Response {
  return { ok: false, status, json: () => Promise.resolve(body) } as Response;
}

// ---------------------------------------------------------------------------
// Reset helpers
// ---------------------------------------------------------------------------

function resetStore(): void {
  useCmsEditor.setState({
    data: DEFAULT_CMS_DATA,
    revisions: [],
    selectedSection: null,
    isDirty: false,
    isSaving: false,
    lastSavedVersion: 1,
  });
}

function makeStoreDirty(): void {
  useCmsEditor.getState().updateSection('hero', { ctaText: 'dirty' });
}

beforeEach(() => {
  vi.restoreAllMocks();
  mockFetch.mockReset();
  global.fetch = mockFetch;
  resetStore();
});

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe('Initial state', () => {
  it('has DEFAULT_CMS_DATA as data', () => {
    const s = useCmsEditor.getState();
    expect(s.data).toEqual(DEFAULT_CMS_DATA);
  });

  it('starts with empty revisions', () => {
    expect(useCmsEditor.getState().revisions).toEqual([]);
  });

  it('starts with selectedSection = null', () => {
    expect(useCmsEditor.getState().selectedSection).toBeNull();
  });

  it('starts with isDirty = false', () => {
    expect(useCmsEditor.getState().isDirty).toBe(false);
  });

  it('starts with isSaving = false', () => {
    expect(useCmsEditor.getState().isSaving).toBe(false);
  });

  it('starts with lastSavedVersion = 1', () => {
    expect(useCmsEditor.getState().lastSavedVersion).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// selectSection
// ---------------------------------------------------------------------------

describe('selectSection', () => {
  it('sets selectedSection to the given key', () => {
    useCmsEditor.getState().selectSection('hero');
    expect(useCmsEditor.getState().selectedSection).toBe('hero');
  });

  it('can switch to a different section', () => {
    useCmsEditor.getState().selectSection('hero');
    useCmsEditor.getState().selectSection('bio');
    expect(useCmsEditor.getState().selectedSection).toBe('bio');
  });

  it('passing null clears the selection', () => {
    useCmsEditor.getState().selectSection('hero');
    useCmsEditor.getState().selectSection(null);
    expect(useCmsEditor.getState().selectedSection).toBeNull();
  });

  it('does not affect isDirty', () => {
    useCmsEditor.getState().selectSection('services');
    expect(useCmsEditor.getState().isDirty).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateSection
// ---------------------------------------------------------------------------

describe('updateSection', () => {
  it('merges patch into the target section', () => {
    useCmsEditor.getState().updateSection('hero', { ctaText: 'Novo CTA' });
    expect(useCmsEditor.getState().data.hero.ctaText).toBe('Novo CTA');
  });

  it('preserves existing fields in the section', () => {
    const original = useCmsEditor.getState().data.hero;
    useCmsEditor.getState().updateSection('hero', { ctaText: 'Novo CTA' });
    const updated = useCmsEditor.getState().data.hero;
    expect(updated.titleHtml).toBe(original.titleHtml);
    expect(updated.description).toBe(original.description);
    expect(updated.scrollLabel).toBe(original.scrollLabel);
    expect(updated.mobileImageUrl).toBe(original.mobileImageUrl);
    expect(updated.desktopImageUrl).toBe(original.desktopImageUrl);
  });

  it('sets isDirty to true', () => {
    useCmsEditor.getState().updateSection('hero', { ctaText: 'x' });
    expect(useCmsEditor.getState().isDirty).toBe(true);
  });

  it('works with an empty patch (marks dirty without changes)', () => {
    const dataBefore = useCmsEditor.getState().data;
    useCmsEditor.getState().updateSection('hero', {});
    expect(useCmsEditor.getState().data).toEqual(dataBefore);
    expect(useCmsEditor.getState().isDirty).toBe(true);
  });

  it('works on any section key', () => {
    useCmsEditor.getState().updateSection('navbar', { brandName: 'Novo Nome' });
    expect(useCmsEditor.getState().data.navbar.brandName).toBe('Novo Nome');
  });

  it('does not mutate the original DEFAULT_CMS_DATA', () => {
    useCmsEditor.getState().updateSection('hero', { ctaText: 'Alterado' });
    expect(DEFAULT_CMS_DATA.hero.ctaText).not.toBe('Alterado');
  });
});

// ---------------------------------------------------------------------------
// updateField
// ---------------------------------------------------------------------------

describe('updateField', () => {
  it('updates a specific field in a section', () => {
    useCmsEditor.getState().updateField('hero', 'ctaText', 'Click aqui');
    expect(useCmsEditor.getState().data.hero.ctaText).toBe('Click aqui');
  });

  it('sets isDirty to true', () => {
    useCmsEditor.getState().updateField('hero', 'ctaText', 'x');
    expect(useCmsEditor.getState().isDirty).toBe(true);
  });

  it('preserves other fields in the section', () => {
    const { description, titleHtml, scrollLabel } = useCmsEditor.getState().data.hero;
    useCmsEditor.getState().updateField('hero', 'ctaText', 'x');
    const hero = useCmsEditor.getState().data.hero;
    expect(hero.description).toBe(description);
    expect(hero.titleHtml).toBe(titleHtml);
    expect(hero.scrollLabel).toBe(scrollLabel);
  });

  it('works on different section types', () => {
    useCmsEditor.getState().updateField('navbar', 'brandName', 'Brand');
    expect(useCmsEditor.getState().data.navbar.brandName).toBe('Brand');

    useCmsEditor.getState().updateField('contact', 'titleHtml', 'Title');
    expect(useCmsEditor.getState().data.contact.titleHtml).toBe('Title');

    useCmsEditor.getState().updateField('services', 'eyebrow', 'Serviços');
    expect(useCmsEditor.getState().data.services.eyebrow).toBe('Serviços');
  });

  it('can set a field to a non-string value (number, boolean)', () => {
    useCmsEditor.getState().updateField('whatsappModal', 'triggerDelay', 5000);
    expect(useCmsEditor.getState().data.whatsappModal.triggerDelay).toBe(5000);

    useCmsEditor.getState().updateField('whatsappModal', 'showOnExitIntent', true);
    expect(useCmsEditor.getState().data.whatsappModal.showOnExitIntent).toBe(true);
  });

  it('does not mutate the original data', () => {
    useCmsEditor.getState().updateField('hero', 'ctaText', 'Updated');
    expect(DEFAULT_CMS_DATA.hero.ctaText).not.toBe('Updated');
  });
});

// ---------------------------------------------------------------------------
// updateTheme
// ---------------------------------------------------------------------------

describe('updateTheme', () => {
  it('updates the specified theme field', () => {
    useCmsEditor.getState().updateTheme('primaryColor', '#FF0000');
    expect(useCmsEditor.getState().data.theme.primaryColor).toBe('#FF0000');
  });

  it('sets isDirty to true', () => {
    useCmsEditor.getState().updateTheme('primaryColor', '#FF0000');
    expect(useCmsEditor.getState().isDirty).toBe(true);
  });

  it('preserves other theme fields', () => {
    const original = useCmsEditor.getState().data.theme;
    useCmsEditor.getState().updateTheme('primaryColor', '#FF0000');
    const theme = useCmsEditor.getState().data.theme;
    expect(theme.accentColor).toBe(original.accentColor);
    expect(theme.backgroundColor).toBe(original.backgroundColor);
    expect(theme.surfaceColor).toBe(original.surfaceColor);
    expect(theme.textColor).toBe(original.textColor);
    expect(theme.headingFont).toBe(original.headingFont);
    expect(theme.bodyFont).toBe(original.bodyFont);
    expect(theme.baseFontSize).toBe(original.baseFontSize);
    expect(theme.sectionPadding).toBe(original.sectionPadding);
  });

  it('can set non-string theme values (number)', () => {
    useCmsEditor.getState().updateTheme('baseFontSize', 18);
    expect(useCmsEditor.getState().data.theme.baseFontSize).toBe(18);
  });

  it('does not mutate the original DEFAULT_THEME', () => {
    useCmsEditor.getState().updateTheme('primaryColor', '#FF0000');
    expect(DEFAULT_THEME.primaryColor).not.toBe('#FF0000');
  });
});

// ---------------------------------------------------------------------------
// reorderSections
// ---------------------------------------------------------------------------

describe('reorderSections', () => {
  function getSectionIds(): string[] {
    return useCmsEditor.getState().data.sectionOrder.map((s) => s.id);
  }

  it('moves a section forward (lower to higher index)', () => {
    useCmsEditor.getState().reorderSections(0, 3);
    const ids = getSectionIds();
    expect(ids[3]).toBe('navbar');
  });

  it('moves a section backward (higher to lower index)', () => {
    useCmsEditor.getState().reorderSections(5, 2);
    const ids = getSectionIds();
    expect(ids[2]).toBe('services');
  });

  it('moves first section to last', () => {
    const last = getSectionIds().length - 1;
    useCmsEditor.getState().reorderSections(0, last);
    const ids = getSectionIds();
    expect(ids[last]).toBe('navbar');
    expect(ids[0]).toBe('hero');
  });

  it('moves last section to first', () => {
    const last = getSectionIds().length - 1;
    useCmsEditor.getState().reorderSections(last, 0);
    const ids = getSectionIds();
    expect(ids[0]).toBe('footer');
    expect(ids[last]).toBe('whatsappModal');
  });

  it('preserves all sections (count unchanged)', () => {
    const before = getSectionIds();
    useCmsEditor.getState().reorderSections(2, 6);
    const after = getSectionIds();
    expect(after).toHaveLength(before.length);
    expect(after.sort()).toEqual(before.sort());
  });

  it('sets isDirty to true', () => {
    useCmsEditor.getState().reorderSections(1, 3);
    expect(useCmsEditor.getState().isDirty).toBe(true);
  });

  it('fromIndex === toIndex still sets isDirty (order unchanged)', () => {
    const before = getSectionIds();
    useCmsEditor.getState().reorderSections(2, 2);
    expect(useCmsEditor.getState().isDirty).toBe(true);
    expect(getSectionIds()).toEqual(before);
  });
});

// ---------------------------------------------------------------------------
// toggleSectionEnabled
// ---------------------------------------------------------------------------

describe('toggleSectionEnabled', () => {
  function getEnabled(id: string): boolean | undefined {
    return useCmsEditor.getState().data.sectionOrder.find((s) => s.id === id)?.enabled;
  }

  it('toggles a section from enabled to disabled', () => {
    expect(getEnabled('hero')).toBe(true);
    useCmsEditor.getState().toggleSectionEnabled('hero');
    expect(getEnabled('hero')).toBe(false);
  });

  it('toggles a section from disabled to enabled', () => {
    useCmsEditor.getState().toggleSectionEnabled('hero');
    expect(getEnabled('hero')).toBe(false);
    useCmsEditor.getState().toggleSectionEnabled('hero');
    expect(getEnabled('hero')).toBe(true);
  });

  it('sets isDirty to true', () => {
    useCmsEditor.getState().toggleSectionEnabled('hero');
    expect(useCmsEditor.getState().isDirty).toBe(true);
  });

  it('does not affect other sections', () => {
    useCmsEditor.getState().toggleSectionEnabled('hero');
    expect(getEnabled('navbar')).toBe(true);
    expect(getEnabled('footer')).toBe(true);
  });

  it('works on the last and first sections', () => {
    useCmsEditor.getState().toggleSectionEnabled('footer');
    expect(getEnabled('footer')).toBe(false);
    useCmsEditor.getState().toggleSectionEnabled('navbar');
    expect(getEnabled('navbar')).toBe(false);
  });

  it('calling with a non-existent id marks dirty but does not throw', () => {
    useCmsEditor.getState().toggleSectionEnabled('non-existent');
    expect(useCmsEditor.getState().isDirty).toBe(true);
  });

  it('does not increase the sectionOrder length', () => {
    const before = useCmsEditor.getState().data.sectionOrder.length;
    useCmsEditor.getState().toggleSectionEnabled('hero');
    expect(useCmsEditor.getState().data.sectionOrder).toHaveLength(before);
  });
});

// ---------------------------------------------------------------------------
// setServerData
// ---------------------------------------------------------------------------

describe('setServerData', () => {
  it('sets data and revisions from the server', () => {
    useCmsEditor.getState().setServerData(serverData, mockRevisions);

    const state = useCmsEditor.getState();
    expect(state.data).toEqual(serverData);
    expect(state.revisions).toEqual(mockRevisions);
  });

  it('clears isDirty', () => {
    useCmsEditor.getState().updateSection('hero', { ctaText: 'dirty' });
    expect(useCmsEditor.getState().isDirty).toBe(true);

    useCmsEditor.getState().setServerData(serverData, mockRevisions);
    expect(useCmsEditor.getState().isDirty).toBe(false);
  });

  it('sets lastSavedVersion from data.meta.version', () => {
    useCmsEditor.getState().setServerData(serverData, mockRevisions);
    expect(useCmsEditor.getState().lastSavedVersion).toBe(serverData.meta.version);
  });

  it('replaces revisions entirely (does not merge)', () => {
    useCmsEditor.getState().setServerData(serverData, mockRevisions);

    const newerRevisions: Revision[] = [
      { version: 10, data: serverData, summary: 'v10', timestamp: '2025-06-10T12:00:00.000Z' },
    ];
    useCmsEditor.getState().setServerData(serverData, newerRevisions);
    expect(useCmsEditor.getState().revisions).toEqual(newerRevisions);
  });

  it('does not alter selectedSection', () => {
    useCmsEditor.getState().selectSection('hero');
    useCmsEditor.getState().setServerData(serverData, mockRevisions);
    expect(useCmsEditor.getState().selectedSection).toBe('hero');
  });
});

// ---------------------------------------------------------------------------
// save -- general behaviour (no timer-dependent retries)
// ---------------------------------------------------------------------------

describe('save', () => {
  // ── Early return when not dirty ────────────────────────────────────────

  it('returns early without fetching when isDirty is false', async () => {
    await useCmsEditor.getState().save('Tester');
    expect(mockFetch).not.toHaveBeenCalled();
    expect(useCmsEditor.getState().isSaving).toBe(false);
  });

  // ── Successful first-attempt save ─────────────────────────────────────

  it('sends PUT request to /api/admin/cms with correct headers and body', async () => {
    mockFetch.mockResolvedValueOnce(createOkResponse());
    makeStoreDirty();

    await useCmsEditor.getState().save('John Doe');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/admin/cms',
      expect.objectContaining({
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: expect.any(String),
      }),
    );

    const sentPayload = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(sentPayload.meta.lastSavedBy).toBe('John Doe');
    expect(sentPayload.meta.version).toBe(2); // lastSavedVersion was 1
    expect(sentPayload.meta.lastSaved).toEqual(expect.any(String));
    expect(sentPayload.hero.ctaText).toBe('dirty');
  });

  it('on success sets isDirty=false, isSaving=false, increments lastSavedVersion, prepends revision', async () => {
    mockFetch.mockResolvedValueOnce(createOkResponse(mockRevision));
    makeStoreDirty();

    await useCmsEditor.getState().save('Tester');

    const state = useCmsEditor.getState();
    expect(state.isDirty).toBe(false);
    expect(state.isSaving).toBe(false);
    expect(state.lastSavedVersion).toBe(2);

    expect(state.revisions).toHaveLength(1);
    expect(state.revisions[0]).toEqual(mockRevision);
  });

  it('prepends revision to existing revisions', async () => {
    useCmsEditor.getState().setServerData(serverData, [
      { version: 2, data: DEFAULT_CMS_DATA, summary: 'v2', timestamp: '2025-06-02T12:00:00.000Z' },
      { version: 1, data: DEFAULT_CMS_DATA, summary: 'v1', timestamp: '2025-06-01T12:00:00.000Z' },
    ]);

    mockFetch.mockResolvedValueOnce(
      createOkResponse({
        version: 3,
        data: serverData,
        summary: 'v3',
        timestamp: '2025-06-03T12:00:00.000Z',
      }),
    );

    useCmsEditor.getState().updateSection('hero', { ctaText: 'x' });
    await useCmsEditor.getState().save('Tester');

    const state = useCmsEditor.getState();
    expect(state.revisions).toHaveLength(3);
    expect(state.revisions[0].version).toBe(3);
    expect(state.revisions[1].version).toBe(2);
    expect(state.revisions[2].version).toBe(1);
  });

  it('caps revisions at 100 after save prepends new revision', async () => {
    const manyRevisions: Revision[] = [];
    for (let i = 0; i < 100; i++) {
      manyRevisions.push({
        version: 100 - i,
        data: DEFAULT_CMS_DATA,
        summary: `rev-${100 - i}`,
        timestamp: new Date().toISOString(),
      });
    }

    useCmsEditor.getState().setServerData(serverData, manyRevisions);
    expect(useCmsEditor.getState().revisions).toHaveLength(100);

    mockFetch.mockResolvedValueOnce(
      createOkResponse({
        version: 101,
        data: serverData,
        summary: 'rev-101',
        timestamp: '2025-07-01T12:00:00.000Z',
      }),
    );

    useCmsEditor.getState().updateSection('hero', { ctaText: 'x' });
    await useCmsEditor.getState().save('Tester');

    expect(useCmsEditor.getState().revisions).toHaveLength(100);
    expect(useCmsEditor.getState().revisions[0].version).toBe(101);
  });

  // ── isSaving lifecycle ────────────────────────────────────────────────

  it('sets isSaving to true while saving and false after success', async () => {
    let resolveFetch!: (value: Response) => void;
    const fetchPromise = new Promise<Response>((r) => {
      resolveFetch = r;
    });
    mockFetch.mockReturnValue(fetchPromise);
    makeStoreDirty();

    const savePromise = useCmsEditor.getState().save('Tester');
    savePromise.catch(() => {});

    // Yield once so the synchronous part of save runs (sets isSaving = true)
    await new Promise((r) => setTimeout(r, 0));

    expect(useCmsEditor.getState().isSaving).toBe(true);

    resolveFetch(createOkResponse(mockRevision));
    await savePromise;

    expect(useCmsEditor.getState().isSaving).toBe(false);
  });

  it('sets isSaving to false after all retries fail', async () => {
    // Use fake timers so the retry delays resolve instantly
    vi.useFakeTimers();

    mockFetch.mockRejectedValue(new Error('fail'));
    makeStoreDirty();

    const savePromise = useCmsEditor.getState().save('Tester');
    savePromise.catch(() => {});

    // Advance past all three retry delays (0 + 1000 + 2000 = 3000ms)
    await vi.advanceTimersByTimeAsync(3000);

    await expect(savePromise).rejects.toThrow('fail');
    expect(useCmsEditor.getState().isSaving).toBe(false);

    vi.useRealTimers();
  });
});

// ---------------------------------------------------------------------------
// save — retry mechanism and HTTP error codes
// (uses fake timers so retry back-offs resolve immediately)
// ---------------------------------------------------------------------------

describe('save retries and error handling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Retry: success after failures ─────────────────────────────────────

  it('retries and succeeds on the second attempt after first fails', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(createOkResponse(mockRevision));

    makeStoreDirty();

    const savePromise = useCmsEditor.getState().save('Tester');
    savePromise.catch(() => {});
    await vi.advanceTimersByTimeAsync(3000);
    await expect(savePromise).resolves.toBeUndefined();

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(useCmsEditor.getState().isDirty).toBe(false);
  });

  it('retries and succeeds on the third attempt after two failures', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(createOkResponse(mockRevision));

    makeStoreDirty();

    const savePromise = useCmsEditor.getState().save('Tester');
    savePromise.catch(() => {});
    await vi.advanceTimersByTimeAsync(3000);
    await expect(savePromise).resolves.toBeUndefined();

    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(useCmsEditor.getState().isDirty).toBe(false);
  });

  // ── Retry: all attempts fail ──────────────────────────────────────────

  it('throws after all 3 attempts fail, keeps isDirty true', async () => {
    mockFetch.mockRejectedValue(new Error('Falha de rede'));

    makeStoreDirty();

    const savePromise = useCmsEditor.getState().save('Tester');
    savePromise.catch(() => {});
    await vi.advanceTimersByTimeAsync(3000);
    await expect(savePromise).rejects.toThrow('Falha de rede');

    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(useCmsEditor.getState().isSaving).toBe(false);
    expect(useCmsEditor.getState().isDirty).toBe(true);
  });

  it('throws a generic "Falha ao salvar" when caught error is not an Error instance', async () => {
    mockFetch.mockRejectedValue('string error');

    makeStoreDirty();

    const savePromise = useCmsEditor.getState().save('Tester');
    savePromise.catch(() => {});
    await vi.advanceTimersByTimeAsync(3000);
    await expect(savePromise).rejects.toThrow('Falha ao salvar');

    expect(useCmsEditor.getState().isSaving).toBe(false);
  });

  // ── HTTP error code handling ──────────────────────────────────────────

  it('throws session-expired message on 401', async () => {
    mockFetch.mockResolvedValue(createErrorResponse(401));

    makeStoreDirty();

    const savePromise = useCmsEditor.getState().save('Tester');
    savePromise.catch(() => {});
    await vi.advanceTimersByTimeAsync(3000);
    await expect(savePromise).rejects.toThrow(
      'Sessão expirada. Faça login novamente.',
    );
  });

  it('throws specific validation message on 422 with details', async () => {
    mockFetch.mockResolvedValue(
      createErrorResponse(422, { details: [{ message: 'Campo obrigatório' }] }),
    );

    makeStoreDirty();

    const savePromise = useCmsEditor.getState().save('Tester');
    savePromise.catch(() => {});
    await vi.advanceTimersByTimeAsync(3000);
    await expect(savePromise).rejects.toThrow(
      'Dados inválidos: Campo obrigatório',
    );
  });

  it('throws fallback validation message on 422 without details', async () => {
    mockFetch.mockResolvedValue(createErrorResponse(422, {}));

    makeStoreDirty();

    const savePromise = useCmsEditor.getState().save('Tester');
    savePromise.catch(() => {});
    await vi.advanceTimersByTimeAsync(3000);
    await expect(savePromise).rejects.toThrow(
      'Dados inválidos: verifique os campos',
    );
  });

  it('throws error message from response body on 500', async () => {
    mockFetch.mockResolvedValue(createErrorResponse(500, { error: 'Internal server error' }));

    makeStoreDirty();

    const savePromise = useCmsEditor.getState().save('Tester');
    savePromise.catch(() => {});
    await vi.advanceTimersByTimeAsync(3000);
    await expect(savePromise).rejects.toThrow('Internal server error');
  });

  it('throws fallback "Erro {status}" when response body has no error key', async () => {
    mockFetch.mockResolvedValue(createErrorResponse(503, {}));

    makeStoreDirty();

    const savePromise = useCmsEditor.getState().save('Tester');
    savePromise.catch(() => {});
    await vi.advanceTimersByTimeAsync(3000);
    await expect(savePromise).rejects.toThrow('Erro 503');
  });

  it('handles json() failure on error response gracefully (fallback to status)', async () => {
    const badJsonResponse = {
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('parse error')),
    } as Response;

    mockFetch.mockResolvedValue(badJsonResponse);

    makeStoreDirty();

    const savePromise = useCmsEditor.getState().save('Tester');
    savePromise.catch(() => {});
    await vi.advanceTimersByTimeAsync(3000);
    await expect(savePromise).rejects.toThrow('Erro 500');
  });
});

// ---------------------------------------------------------------------------
// revertToRevision
// ---------------------------------------------------------------------------

describe('revertToRevision', () => {
  const revisionData: GlobalConfig = {
    ...DEFAULT_CMS_DATA,
    hero: { ...DEFAULT_CMS_DATA.hero, ctaText: 'Revived CTA' },
    meta: { ...DEFAULT_CMS_DATA.meta, version: 42 },
  };

  const revision: Revision = {
    version: 42,
    data: revisionData,
    summary: 'Reverted to v42',
    timestamp: '2025-06-15T10:00:00.000Z',
  };

  it('sets data from the revision object', () => {
    useCmsEditor.getState().revertToRevision(revision);
    expect(useCmsEditor.getState().data).toEqual(revisionData);
    expect(useCmsEditor.getState().data.hero.ctaText).toBe('Revived CTA');
  });

  it('sets isDirty to true', () => {
    useCmsEditor.getState().revertToRevision(revision);
    expect(useCmsEditor.getState().isDirty).toBe(true);
  });

  it('clears selectedSection', () => {
    useCmsEditor.getState().selectSection('hero');
    expect(useCmsEditor.getState().selectedSection).toBe('hero');

    useCmsEditor.getState().revertToRevision(revision);
    expect(useCmsEditor.getState().selectedSection).toBeNull();
  });

  it('does not modify the revisions array', () => {
    useCmsEditor.getState().setServerData(serverData, mockRevisions);
    const revisionsBefore = useCmsEditor.getState().revisions;

    useCmsEditor.getState().revertToRevision(revision);

    expect(useCmsEditor.getState().revisions).toEqual(revisionsBefore);
  });
});

// ---------------------------------------------------------------------------
// publish
// ---------------------------------------------------------------------------

describe('publish', () => {
  it('calls save with lastSavedBy when dirty and lastSavedBy is set', async () => {
    useCmsEditor.getState().setServerData(
      {
        ...DEFAULT_CMS_DATA,
        meta: { lastSaved: '2025-06-01T00:00:00.000Z', lastSavedBy: 'Editor', version: 5 },
      },
      [],
    );

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          revision: {
            version: 6,
            data: DEFAULT_CMS_DATA,
            summary: 'Published',
            timestamp: '2025-06-15T00:00:00.000Z',
          },
        }),
    } as Response);

    useCmsEditor.getState().updateSection('hero', { ctaText: 'published' });
    await useCmsEditor.getState().publish();

    expect(mockFetch).toHaveBeenCalledTimes(1);

    const sentBody = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(sentBody.meta.lastSavedBy).toBe('Editor');
    expect(sentBody.meta.version).toBe(6);
    expect(useCmsEditor.getState().isDirty).toBe(false);
  });

  it('falls back to Admin when lastSavedBy is null', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          revision: {
            version: 2,
            data: DEFAULT_CMS_DATA,
            summary: 'Published',
            timestamp: '2025-06-15T00:00:00.000Z',
          },
        }),
    } as Response);

    useCmsEditor.getState().updateSection('hero', { ctaText: 'x' });
    await useCmsEditor.getState().publish();

    const sentBody = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(sentBody.meta.lastSavedBy).toBe('Admin');
  });

  it('does nothing when not dirty', async () => {
    await useCmsEditor.getState().publish();
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Integration: full lifecycle
// ---------------------------------------------------------------------------

describe('Integration: full edit-save-revert lifecycle', () => {
  it('models a realistic multi-step workflow', async () => {
    // 1. Start fresh
    expect(useCmsEditor.getState().isDirty).toBe(false);

    // 2. Select a section and edit it
    useCmsEditor.getState().selectSection('hero');
    useCmsEditor.getState().updateField('hero', 'ctaText', 'Novo CTA');
    expect(useCmsEditor.getState().isDirty).toBe(true);

    // 3. Also change theme
    useCmsEditor.getState().updateTheme('primaryColor', '#FF0000');

    // 4. Save (mock the API)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          revision: {
            version: 2,
            data: useCmsEditor.getState().data,
            summary: 'Atualização hero + theme',
            timestamp: new Date().toISOString(),
          },
        }),
    } as Response);

    await useCmsEditor.getState().save('Tester');
    expect(useCmsEditor.getState().isDirty).toBe(false);
    expect(useCmsEditor.getState().lastSavedVersion).toBe(2);
    expect(useCmsEditor.getState().data.hero.ctaText).toBe('Novo CTA');
    expect(useCmsEditor.getState().data.theme.primaryColor).toBe('#FF0000');

    // 5. Revert to a previous revision
    const oldData: GlobalConfig = {
      ...DEFAULT_CMS_DATA,
      hero: { ...DEFAULT_CMS_DATA.hero, ctaText: 'CTA Original' },
    };
    useCmsEditor.getState().revertToRevision({
      version: 1,
      data: oldData,
      summary: 'Estado original',
      timestamp: '2025-06-01T00:00:00.000Z',
    });

    expect(useCmsEditor.getState().isDirty).toBe(true);
    expect(useCmsEditor.getState().data.hero.ctaText).toBe('CTA Original');
    expect(useCmsEditor.getState().data.theme.primaryColor).toBe(
      DEFAULT_THEME.primaryColor,
    );

    // 6. Save the reverted state
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          revision: {
            version: 3,
            data: useCmsEditor.getState().data,
            summary: 'Revertido',
            timestamp: new Date().toISOString(),
          },
        }),
    } as Response);

    await useCmsEditor.getState().save('Tester');
    expect(useCmsEditor.getState().isDirty).toBe(false);
    expect(useCmsEditor.getState().lastSavedVersion).toBe(3);

    // 7. Reorder sections
    useCmsEditor.getState().reorderSections(0, 5);
    expect(useCmsEditor.getState().isDirty).toBe(true);

    // 8. Publish (which saves)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          revision: {
            version: 4,
            data: useCmsEditor.getState().data,
            summary: 'Published',
            timestamp: new Date().toISOString(),
          },
        }),
    } as Response);

    await useCmsEditor.getState().publish();
    expect(useCmsEditor.getState().isDirty).toBe(false);
    expect(useCmsEditor.getState().lastSavedVersion).toBe(4);
  });
});
