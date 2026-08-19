// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { AdminErrorBoundary, AdminErrorFallback } from './error-boundary'

const ThrowComponent = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Erro de teste')
  }
  return <div>Renderizado com sucesso</div>
}

describe('AdminErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <AdminErrorBoundary>
        <div>Conteúdo seguro</div>
      </AdminErrorBoundary>,
    )
    expect(screen.getByText('Conteúdo seguro')).toBeDefined()
  })

  it('renders default fallback when child throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <AdminErrorBoundary>
        <ThrowComponent shouldThrow={true} />
      </AdminErrorBoundary>,
    )
    expect(screen.getByText('Algo deu errado')).toBeDefined()
    expect(screen.getByText('Erro de teste')).toBeDefined()
    expect(screen.getByText('Tentar novamente')).toBeDefined()
  })

  it('renders custom fallback when provided', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <AdminErrorBoundary fallback={<div>Fallback customizado</div>}>
        <ThrowComponent shouldThrow={true} />
      </AdminErrorBoundary>,
    )
    expect(screen.getByText('Fallback customizado')).toBeDefined()
    expect(screen.queryByText('Algo deu errado')).toBeNull()
  })

  it('resets error state when onReset is called from AdminErrorFallback', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const onResetSpy = vi.fn()
    render(<AdminErrorFallback error={new Error('erro')} onReset={onResetSpy} />)
    fireEvent.click(screen.getByText('Tentar novamente'))
    expect(onResetSpy).toHaveBeenCalledOnce()
  })
})

describe('AdminErrorFallback', () => {
  it('renders error message', () => {
    render(<AdminErrorFallback error={new Error('Erro crítico')} />)
    expect(screen.getByText('Algo deu errado')).toBeDefined()
    expect(screen.getByText('Erro crítico')).toBeDefined()
  })

  it('renders without error details when error is null', () => {
    render(<AdminErrorFallback error={null} />)
    expect(screen.getByText('Algo deu errado')).toBeDefined()
  })

  it('renders retry button when onReset provided', () => {
    render(<AdminErrorFallback error={new Error('erro')} onReset={() => {}} />)
    expect(screen.getByText('Tentar novamente')).toBeDefined()
  })

  it('does not render retry button when onReset not provided', () => {
    render(<AdminErrorFallback error={new Error('erro')} />)
    expect(screen.queryByText('Tentar novamente')).toBeNull()
  })

  it('calls onReset when retry button clicked', () => {
    const onReset = vi.fn()
    render(<AdminErrorFallback error={new Error('erro')} onReset={onReset} />)
    fireEvent.click(screen.getByText('Tentar novamente'))
    expect(onReset).toHaveBeenCalledOnce()
  })
})
