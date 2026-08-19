// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/test-utils'

const mocks = vi.hoisted(() => ({
  track: vi.fn(),
  trackSectionView: vi.fn(),
  getMarketingAttribution: vi.fn(() => ({
    source: null,
    medium: null,
    campaign: null,
    term: null,
    content: null,
  })),
  saveLeadData: vi.fn(),
  getLeadData: vi.fn(() => ({ name: '', email: '', phone: '' })),
  openModal: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/lib/analytics', () => ({
  track: mocks.track,
  trackSectionView: mocks.trackSectionView,
}))

vi.mock('@/lib/use-marketing-attribution', () => ({
  getMarketingAttribution: mocks.getMarketingAttribution,
}))

vi.mock('@/lib/use-lead-persistence', () => ({
  saveLeadData: mocks.saveLeadData,
  getLeadData: mocks.getLeadData,
}))

vi.mock('@/components/gislaine/whatsapp-context', () => ({
  useWhatsAppModal: () => ({
    config: {
      title: 'Fale Conosco',
      message: 'Olá',
      buttonText: 'WhatsApp',
      phoneNumber: '5511999999999',
      triggerDelay: 100000,
      showOnExitIntent: true,
    },
    openModal: mocks.openModal,
  }),
}))

vi.mock('@/hooks/use-cms-data', () => ({
  useCmsData: () => ({
    data: {
      theme: {},
      contact: {
        eyebrow: 'Fale Conosco',
        titleHtml: '<strong>Pronto para mudar</strong> a forma como você vende?',
        description: 'Vamos conversar sobre como posso te ajudar.',
        features: ['Resposta rápida', 'Atendimento personalizado'],
        guaranteeTitle: 'Garantia',
        guaranteeDescription: '100% seguro',
        submitButtonText: 'Enviar mensagem',
      },
    },
    loading: false,
  }),
}))

import { ContactSection } from './contact'

describe('ContactSection', () => {
  beforeEach(() => {
    mocks.track.mockReset()
    mocks.openModal.mockReset()
  })

  it('renders the contact section', () => {
    render(<ContactSection />)
    expect(screen.getByText(/Fale Conosco/i)).toBeDefined()
  })

  it('renders the form fields', () => {
    render(<ContactSection />)
    expect(document.querySelector('input[name="name"]')).not.toBeNull()
    expect(document.querySelector('input[name="email"]')).not.toBeNull()
    expect(document.querySelector('input[name="phone"]')).not.toBeNull()
  })

  it('tracks form_started on first input change', () => {
    render(<ContactSection />)
    const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement
    fireEvent.change(nameInput, { target: { value: 'João' } })
    expect(mocks.track).toHaveBeenCalledWith('contact_form_started', {})
  })

  it('updates form fields on change', () => {
    render(<ContactSection />)
    const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement
    fireEvent.change(nameInput, { target: { value: 'João' } })
    expect(nameInput.value).toBe('João')
  })

  it('tracks form error on server validation failure', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'E-mail inválido' }),
    } as any)

    render(<ContactSection />)
    const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement
    const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement
    const phoneInput = document.querySelector('input[name="phone"]') as HTMLInputElement
    fireEvent.change(nameInput, { target: { value: 'João' } })
    fireEvent.change(emailInput, { target: { value: 'invalid@x' } })
    fireEvent.change(phoneInput, { target: { value: '11999999999' } })
    fireEvent.click(screen.getByRole('button', { name: /Enviar/i }))
    await waitFor(() => {
      expect(mocks.track).toHaveBeenCalledWith('contact_form_error', expect.objectContaining({ error: 'HTTP error' }))
    })
  })

  it('calls track with contact_form_submitted on submit', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, syncedToCms: true }),
    } as any)

    render(<ContactSection />)
    const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement
    const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement
    const phoneInput = document.querySelector('input[name="phone"]') as HTMLInputElement
    fireEvent.change(nameInput, { target: { value: 'João' } })
    fireEvent.change(emailInput, { target: { value: 'joao@example.com' } })
    fireEvent.change(phoneInput, { target: { value: '11999999999' } })
    fireEvent.click(screen.getByRole('button', { name: /Enviar/i }))
    await waitFor(() => {
      expect(mocks.track).toHaveBeenCalledWith('contact_form_submitted', expect.any(Object))
    })
  })

  it('submits form via fetch with form data', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, syncedToCms: true }),
    } as any)
    globalThis.fetch = fetchSpy

    render(<ContactSection />)
    const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement
    const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement
    const phoneInput = document.querySelector('input[name="phone"]') as HTMLInputElement
    fireEvent.change(nameInput, { target: { value: 'Maria' } })
    fireEvent.change(emailInput, { target: { value: 'maria@example.com' } })
    fireEvent.change(phoneInput, { target: { value: '11999999999' } })
    fireEvent.click(screen.getByRole('button', { name: /Enviar/i }))
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('/api/contact', expect.objectContaining({
        method: 'POST',
      }))
    })
  })
})
