// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/test-utils'
import { LeadsTable } from './leads-table'

const mockLeads = [
  { id: '1', name: 'João Silva', email: 'joao@test.com', phone: '5511999999999', message: 'Quero saber mais', source: 'google', medium: 'cpc', campaign: 'camp1', createdAt: '2026-06-10T10:00:00Z' },
  { id: '2', name: 'Maria Santos', email: 'maria@test.com', phone: '5511888888888', message: null, source: 'direct', medium: null, campaign: null, createdAt: '2026-06-09T08:30:00Z' },
  { id: '3', name: 'Carlos Pereira', email: 'carlos@test.com', phone: '5511777777777', message: 'Agendamento', source: 'instagram', medium: 'social', campaign: 'insta', createdAt: '2026-06-08T15:45:00Z' },
]

describe('LeadsTable', () => {
  let fetchMock: ReturnType<typeof vi.fn>
  let confirmMock: ReturnType<typeof vi.SpyInstance>

  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn()
    fetchMock = vi.fn()
    // @ts-expect-error global fetch in jsdom
    global.fetch = fetchMock
    confirmMock = vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  afterEach(() => {
    confirmMock.mockRestore()
    // @ts-expect-error cleanup
    delete (global as any).fetch
  })

  it('renders table headers', () => {
    render(<LeadsTable leads={mockLeads} />)
    expect(screen.getByText('Nome')).toBeDefined()
    expect(screen.getByText('Email')).toBeDefined()
    expect(screen.getByText('Origem')).toBeDefined()
    expect(screen.getByText('Data')).toBeDefined()
    expect(screen.getByText('Ações')).toBeDefined()
  })

  it('renders all leads', () => {
    render(<LeadsTable leads={mockLeads} />)
    expect(screen.getByText('João Silva')).toBeDefined()
    expect(screen.getByText('Maria Santos')).toBeDefined()
    expect(screen.getByText('Carlos Pereira')).toBeDefined()
  })

  it('shows source labels', () => {
    render(<LeadsTable leads={mockLeads} />)
    expect(screen.getByText('Google')).toBeDefined()
    expect(screen.getByText('Direto')).toBeDefined()
    expect(screen.getByText('Instagram')).toBeDefined()
  })

  it('renders search input', () => {
    render(<LeadsTable leads={mockLeads} />)
    expect(screen.getByPlaceholderText(/Buscar por nome/)).toBeDefined()
  })

  it('filters leads by name on search', () => {
    render(<LeadsTable leads={mockLeads} />)
    const searchInput = screen.getByPlaceholderText(/Buscar por nome/)
    fireEvent.change(searchInput, { target: { value: 'Maria' } })
    expect(screen.getByText('Maria Santos')).toBeDefined()
    expect(screen.queryByText('João Silva')).toBeNull()
    expect(screen.queryByText('Carlos Pereira')).toBeNull()
  })

  it('filters leads by email on search', () => {
    render(<LeadsTable leads={mockLeads} />)
    const searchInput = screen.getByPlaceholderText(/Buscar por nome/)
    fireEvent.change(searchInput, { target: { value: 'carlos@test' } })
    expect(screen.getByText('Carlos Pereira')).toBeDefined()
    expect(screen.queryByText('Maria Santos')).toBeNull()
  })

  it('shows all leads when search is cleared', () => {
    render(<LeadsTable leads={mockLeads} />)
    const searchInput = screen.getByPlaceholderText(/Buscar por nome/)
    fireEvent.change(searchInput, { target: { value: 'Maria' } })
    expect(screen.queryByText('João Silva')).toBeNull()
    fireEvent.change(searchInput, { target: { value: '' } })
    expect(screen.getByText('João Silva')).toBeDefined()
    expect(screen.getByText('Maria Santos')).toBeDefined()
  })

  it('sorts by name on header click', () => {
    render(<LeadsTable leads={mockLeads} />)
    const nameHeader = screen.getByText('Nome')
    fireEvent.click(nameHeader)
    const rows = document.querySelectorAll('tbody tr')
    expect(rows.length).toBe(3)
  })

  it('opens detail drawer on lead click', () => {
    render(<LeadsTable leads={mockLeads} />)
    fireEvent.click(screen.getByText('João Silva'))
    expect(screen.getByText('Quero saber mais')).toBeDefined()
  })

  it('shows email in detail drawer', () => {
    render(<LeadsTable leads={mockLeads} />)
    fireEvent.click(screen.getByText('João Silva'))
    const emails = screen.getAllByText('joao@test.com')
    expect(emails.length).toBeGreaterThanOrEqual(1)
  })

  it('shows message in detail drawer when present', () => {
    render(<LeadsTable leads={mockLeads} />)
    fireEvent.click(screen.getByText('João Silva'))
    expect(screen.getByText('Quero saber mais')).toBeDefined()
  })

  it('shows WhatsApp link in detail drawer', () => {
    render(<LeadsTable leads={mockLeads} />)
    fireEvent.click(screen.getByText('João Silva'))
    expect(screen.getByText(/5511999999999/)).toBeDefined()
  })

  it('closes detail drawer', () => {
    render(<LeadsTable leads={mockLeads} />)
    fireEvent.click(screen.getByText('João Silva'))
    expect(screen.getByText('Quero saber mais')).toBeDefined()
    const closeBtn = screen.getByRole('button', { name: /fechar/i })
    fireEvent.click(closeBtn)
    expect(screen.queryByText('Quero saber mais')).toBeNull()
  })

  it('shows empty state when no leads', () => {
    render(<LeadsTable leads={[]} />)
    expect(screen.getByText('Nenhum lead encontrado.')).toBeDefined()
  })

  it('shows "Nenhum lead corresponde" when search yields no results', () => {
    render(<LeadsTable leads={mockLeads} />)
    const searchInput = screen.getByPlaceholderText(/Buscar por nome/)
    fireEvent.change(searchInput, { target: { value: 'zzzznonexistent' } })
    expect(screen.getByText(/Nenhum lead encontrado/)).toBeDefined()
  })

  describe('Seleção e exclusão', () => {
    it('mostra a barra de ações ao selecionar um lead', () => {
      const { container } = render(<LeadsTable leads={mockLeads} />)
      const rowCheckboxes = container.querySelectorAll('input[type="checkbox"]')
      // first data row checkbox (header "select all" is a button, not an input)
      fireEvent.click(rowCheckboxes[0])
      expect(screen.getByText('1 selecionado(s)')).toBeDefined()
      expect(screen.getByRole('button', { name: /Excluir 1 lead/i })).toBeDefined()
    })

    it('seleciona todos os leads da página via cabeçalho', () => {
      const { container } = render(<LeadsTable leads={mockLeads} />)
      const selectAllBtn = screen.getByRole('button', { name: /Selecionar todos da página/i })
      fireEvent.click(selectAllBtn)
      expect(screen.getByText(`${mockLeads.length} selecionado(s)`)).toBeDefined()
    })

    it('limpa a seleção ao clicar em Limpar', () => {
      const { container } = render(<LeadsTable leads={mockLeads} />)
      const rowCheckboxes = container.querySelectorAll('input[type="checkbox"]')
      fireEvent.click(rowCheckboxes[0])
      expect(screen.getByText('1 selecionado(s)')).toBeDefined()
      fireEvent.click(screen.getByRole('button', { name: /Limpar seleção/i }))
      expect(screen.queryByText(/selecionado\(s\)/)).toBeNull()
    })

    it('exclui leads selecionados em massa (bulk delete)', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ deleted: 1, requested: 1 }),
      })
      const onDeleted = vi.fn()
      const { container } = render(<LeadsTable leads={mockLeads} onDeleted={onDeleted} />)
      const rowCheckboxes = container.querySelectorAll('input[type="checkbox"]')
      fireEvent.click(rowCheckboxes[0]) // select first row (id '1')

      await fireEvent.click(screen.getByRole('button', { name: /Excluir 1 lead/i }))

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(1)
      })
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/admin/leads',
        expect.objectContaining({
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: ['1'] }),
        }),
      )
      await waitFor(() => {
        expect(onDeleted).toHaveBeenCalledWith(['1'])
      })
      // toolbar cleared after success
      expect(screen.queryByText(/selecionado\(s\)/)).toBeNull()
    })

    it('individual delete from detail drawer calls API with ?id=', async () => {
      fetchMock.mockResolvedValue({ ok: true, json: async () => ({ deleted: 1, requested: 1 }) })
      const onDeleted = vi.fn()
      const { container } = render(<LeadsTable leads={mockLeads} onDeleted={onDeleted} />)

      // open drawer
      fireEvent.click(screen.getByText('João Silva'))
      expect(screen.getByText('Detalhes do Lead')).toBeDefined()

      // click the per-lead delete button in the drawer
      await fireEvent.click(screen.getByLabelText('Excluir este lead'))

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith('/api/admin/leads?id=1', { method: 'DELETE' })
      })
      await waitFor(() => {
        expect(onDeleted).toHaveBeenCalledWith(['1'])
      })
      // drawer closes after delete
      expect(screen.queryByText('Detalhes do Lead')).toBeNull()
    })

    it('exibe erro quando a exclusão falha', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'nope' }),
      })
      const { container } = render(<LeadsTable leads={mockLeads} />)
      const rowCheckboxes = container.querySelectorAll('input[type="checkbox"]')
      fireEvent.click(rowCheckboxes[0])
      await fireEvent.click(screen.getByRole('button', { name: /Excluir 1 lead/i }))
      await waitFor(() => {
        expect(screen.getByText(/nope/)).toBeDefined()
      })
    })

    it('cancela a exclusão quando confirm retorna false', async () => {
      confirmMock.mockReturnValueOnce(false)
      const { container } = render(<LeadsTable leads={mockLeads} />)
      const rowCheckboxes = container.querySelectorAll('input[type="checkbox"]')
      fireEvent.click(rowCheckboxes[0])
      await fireEvent.click(screen.getByRole('button', { name: /Excluir 1 lead/i }))
      await waitFor(() => {
        expect(fetchMock).not.toHaveBeenCalled()
      })
      // selection remains
      expect(screen.getByText('1 selecionado(s)')).toBeDefined()
    })
  })
})
