// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { IntegrationCard } from './integration-card'

describe('IntegrationCard', () => {
  it('renders title', () => {
    render(<IntegrationCard title="Google Analytics" configured={false} onEdit={() => {}} />)
    expect(screen.getByText('Google Analytics')).toBeDefined()
  })

  it('shows configured status when configured', () => {
    render(<IntegrationCard title="GA4" configured={true} onEdit={() => {}} />)
    expect(screen.getByText('Configurado')).toBeDefined()
  })

  it('shows not configured status when not configured', () => {
    render(<IntegrationCard title="GA4" configured={false} onEdit={() => {}} />)
    expect(screen.getByText('Não configurado')).toBeDefined()
  })

  it('renders edit button', () => {
    render(<IntegrationCard title="GA4" configured={false} onEdit={() => {}} />)
    expect(screen.getByText('Editar')).toBeDefined()
  })

  it('calls onEdit when edit button clicked', () => {
    const onEdit = vi.fn()
    render(<IntegrationCard title="GA4" configured={false} onEdit={onEdit} />)
    fireEvent.click(screen.getByText('Editar'))
    expect(onEdit).toHaveBeenCalledOnce()
  })
})
