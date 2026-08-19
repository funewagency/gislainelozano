// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { KpiSkeleton, ChartSkeleton, TableSkeleton, RetryBanner, EmptyState } from './admin-skeleton'

describe('KpiSkeleton', () => {
  it('renders 4 placeholder cards', () => {
    const { container } = render(<KpiSkeleton />)
    const cards = container.firstElementChild!.children
    expect(cards).toHaveLength(4)
  })

  it('has grid layout classes', () => {
    const { container } = render(<KpiSkeleton />)
    const grid = container.firstElementChild!
    expect(grid.className).toContain('grid')
  })
})

describe('ChartSkeleton', () => {
  it('renders with default height', () => {
    const { container } = render(<ChartSkeleton />)
    expect(container.querySelector('.p-4')).toBeDefined()
  })

  it('renders with custom height', () => {
    const { container } = render(<ChartSkeleton height={400} />)
    const placeholder = container.querySelector('[style*="height"]')
    expect(placeholder?.getAttribute('style')).toContain('400')
  })

  it('has animate-pulse class', () => {
    render(<ChartSkeleton />)
    const animated = document.querySelectorAll('.animate-pulse')
    expect(animated.length).toBeGreaterThanOrEqual(2)
  })
})

describe('TableSkeleton', () => {
  it('renders default 5 rows', () => {
    const { container } = render(<TableSkeleton />)
    const rows = container.querySelectorAll('tbody tr')
    expect(rows).toHaveLength(5)
  })

  it('renders custom row count', () => {
    const { container } = render(<TableSkeleton rows={3} />)
    const rows = container.querySelectorAll('tbody tr')
    expect(rows).toHaveLength(3)
  })

  it('renders 5 columns per row', () => {
    const { container } = render(<TableSkeleton rows={1} />)
    const cells = container.querySelectorAll('tbody td')
    expect(cells).toHaveLength(5)
  })

  it('renders 5 header columns', () => {
    const { container } = render(<TableSkeleton />)
    const headers = container.querySelectorAll('thead th')
    expect(headers).toHaveLength(5)
  })
})

describe('RetryBanner', () => {
  it('renders default error message', () => {
    render(<RetryBanner onRetry={() => {}} />)
    expect(screen.getByText('Falha ao carregar dados.')).toBeDefined()
  })

  it('renders custom error message', () => {
    render(<RetryBanner onRetry={() => {}} message="Erro de rede" />)
    expect(screen.getByText('Erro de rede')).toBeDefined()
  })

  it('renders retry button with correct text', () => {
    render(<RetryBanner onRetry={() => {}} />)
    expect(screen.getByText('Tentar novamente')).toBeDefined()
  })

  it('calls onRetry when button clicked', () => {
    const onRetry = vi.fn()
    render(<RetryBanner onRetry={onRetry} />)
    fireEvent.click(screen.getByText('Tentar novamente'))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('renders warning icon SVG', () => {
    render(<RetryBanner onRetry={() => {}} />)
    const svg = document.querySelector('svg')
    expect(svg).toBeDefined()
  })

  it('has error styling', () => {
    const { container } = render(<RetryBanner onRetry={() => {}} />)
    const banner = container.firstElementChild as HTMLElement
    expect(banner.style.backgroundColor).toBe('rgb(254, 242, 242)')
  })
})

describe('EmptyState', () => {
  it('renders with required title', () => {
    render(<EmptyState title="Nenhum dado" />)
    expect(screen.getByText('Nenhum dado')).toBeDefined()
  })

  it('renders with description', () => {
    render(<EmptyState title="Vazio" description="Nenhum item encontrado" />)
    expect(screen.getByText('Nenhum item encontrado')).toBeDefined()
  })

  it('renders with icon', () => {
    render(<EmptyState title="Vazio" icon={<span data-testid="test-icon">🔍</span>} />)
    expect(screen.getByTestId('test-icon')).toBeDefined()
  })

  it('renders with action element', () => {
    render(<EmptyState title="Vazio" action={<button>Adicionar</button>} />)
    expect(screen.getByText('Adicionar')).toBeDefined()
  })

  it('does not render description when not provided', () => {
    const { container } = render(<EmptyState title="Vazio" />)
    const paragraphs = container.querySelectorAll('p')
    expect(paragraphs).toHaveLength(0)
  })

  it('does not render icon when not provided', () => {
    render(<EmptyState title="Vazio" />)
    const iconContainer = document.querySelector('.mb-4')
    expect(iconContainer).toBeNull()
  })
})
