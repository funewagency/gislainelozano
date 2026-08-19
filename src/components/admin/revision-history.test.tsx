// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { RevisionHistory } from './revision-history'

const mockData = vi.hoisted(() => ({
  revisions: [
    { version: 4, summary: 'Atualização hero', timestamp: '2026-06-09T12:00:00Z', createdBy: 'admin' },
    { version: 3, summary: 'Novos serviços', timestamp: '2026-06-08T12:00:00Z', createdBy: 'admin' },
  ],
  data: {
    meta: { version: 5, lastSaved: '2026-06-10T12:00:00Z', lastSavedBy: 'admin' },
    theme: {} as any,
    sectionOrder: [],
  },
  revertToRevision: vi.fn(),
}))

vi.mock('@/lib/cms-store', () => ({
  useCmsEditor: (selector: (s: any) => any) => {
    return selector({
      revisions: mockData.revisions,
      data: mockData.data,
      revertToRevision: mockData.revertToRevision,
    })
  },
}))

describe('RevisionHistory', () => {
  beforeEach(() => {
    vi.stubGlobal('confirm', vi.fn(() => true))
    mockData.revisions = [
      { version: 4, summary: 'Atualização hero', timestamp: '2026-06-09T12:00:00Z', createdBy: 'admin' },
      { version: 3, summary: 'Novos serviços', timestamp: '2026-06-08T12:00:00Z', createdBy: 'admin' },
    ]
    mockData.data = {
      meta: { version: 5, lastSaved: '2026-06-10T12:00:00Z', lastSavedBy: 'admin' },
      theme: {} as any,
      sectionOrder: [],
    }
    mockData.revertToRevision.mockReset()
  })

  it('renders current state header', () => {
    render(<RevisionHistory />)
    expect(screen.getByText('Versão atual')).toBeDefined()
  })

  it('shows current version number', () => {
    render(<RevisionHistory />)
    expect(screen.getByText(/v5/)).toBeDefined()
  })

  it('renders revision list items', () => {
    render(<RevisionHistory />)
    expect(screen.getByText(/Atualização hero/)).toBeDefined()
    expect(screen.getByText(/Novos serviços/)).toBeDefined()
  })

  it('shows version number for each revision', () => {
    render(<RevisionHistory />)
    expect(screen.getByText(/v4/)).toBeDefined()
    expect(screen.getByText(/v3/)).toBeDefined()
  })

  it('shows created by info when available', () => {
    render(<RevisionHistory />)
    const results = screen.getAllByText(/por admin/)
    expect(results.length).toBeGreaterThanOrEqual(1)
  })

  it('calls revertToRevision when a revision is clicked', () => {
    render(<RevisionHistory />)
    const revisionItem = screen.getByText(/Atualização hero/).closest('[role="button"]')
    if (revisionItem) fireEvent.click(revisionItem)
    expect(mockData.revertToRevision).toHaveBeenCalledOnce()
  })

  it('calls revertToRevision on Enter key', () => {
    render(<RevisionHistory />)
    const revisionItem = screen.getByText(/Atualização hero/).closest('[role="button"]')
    if (revisionItem) fireEvent.keyDown(revisionItem, { key: 'Enter' })
    expect(mockData.revertToRevision).toHaveBeenCalledOnce()
  })

  it('calls revertToRevision on Space key', () => {
    render(<RevisionHistory />)
    const revisionItem = screen.getByText(/Novos serviços/).closest('[role="button"]')
    if (revisionItem) fireEvent.keyDown(revisionItem, { key: ' ' })
    expect(mockData.revertToRevision).toHaveBeenCalledOnce()
  })

  it('shows empty state when no revisions', () => {
    mockData.revisions = []
    render(<RevisionHistory />)
    expect(screen.getByText('Nenhuma revisão ainda')).toBeDefined()
  })

  it('shows "Ainda não salvo" when no lastSaved date', () => {
    mockData.data.meta.lastSaved = null as any
    render(<RevisionHistory />)
    expect(screen.getByText(/Ainda não salvo/)).toBeDefined()
  })

  it('hides "Ainda não salvo" when lastSaved exists', () => {
    render(<RevisionHistory />)
    expect(screen.queryByText('Ainda não salvo')).toBeNull()
  })
})
