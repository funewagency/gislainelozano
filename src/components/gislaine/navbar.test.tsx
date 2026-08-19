// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { ReactElement } from 'react'

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  pathname: vi.fn(() => '/'),
  track: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push, replace: vi.fn(), back: vi.fn() }),
  usePathname: () => mocks.pathname(),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/lib/analytics', () => ({
  track: mocks.track,
  trackWhatsAppClick: (position: string) => mocks.track('whatsapp_click', { position }),
}))

vi.mock('@/hooks/use-cms-data', () => ({
  useCmsData: () => ({
    data: {
      theme: {},
      navbar: {
        logoUrl: '/logo.png',
        brandName: 'Gislaine',
        whatsappUrl: 'https://wa.me/5511999999999',
        links: [
          { id: 'sobre', label: 'Sobre', sectionId: '#sobre' },
          { id: 'servicos', label: 'Serviços', sectionId: '#servicos' },
          { id: 'depoimentos', label: 'Depoimentos', sectionId: '#depoimentos' },
          { id: 'contato', label: 'Contato', sectionId: '#contato' },
        ],
      },
    },
    loading: false,
  }),
}))

vi.mock('./whatsapp-context', () => ({
  useWhatsAppModal: () => ({
    config: {
      title: 'Fale Conosco',
      message: 'Oi',
      buttonText: 'Abrir',
      phoneNumber: '5511999999999',
      triggerDelay: 100000,
      showOnExitIntent: true,
    },
    openModal: vi.fn(),
    closeModal: vi.fn(),
  }),
  WhatsAppProvider: ({ children }: any) => children,
}))

import { Navbar } from './navbar'

const renderNavbar = (ui: ReactElement = <Navbar />) => render(ui)

describe('Navbar', () => {
  beforeEach(() => {
    mocks.track.mockReset()
    mocks.pathname.mockReturnValue('/')
  })

  it('renders the site logo/brand', () => {
    renderNavbar()
    const logo = document.querySelector('img[alt*="Gislaine"]')
    expect(logo).not.toBeNull()
  })

  it('renders navigation links from CMS data', () => {
    renderNavbar()
    expect(screen.getByText('Sobre')).toBeDefined()
    expect(screen.getByText('Serviços')).toBeDefined()
    expect(screen.getByText('Depoimentos')).toBeDefined()
    expect(screen.getByText('Contato')).toBeDefined()
  })

  it('tracks click on link', () => {
    renderNavbar()
    fireEvent.click(screen.getByText('Sobre'))
    expect(mocks.track).toHaveBeenCalledWith('navbar_link_click', { target: expect.any(String) })
  })

  it('opens mobile menu on hamburger click', () => {
    renderNavbar()
    const menuBtn = screen.getByLabelText(/Abrir menu/i)
    fireEvent.click(menuBtn)
    expect(screen.getByLabelText(/Fechar menu/i)).toBeDefined()
  })

  it('has WhatsApp CTA button', () => {
    renderNavbar()
    const buttons = screen.getAllByRole('button')
    const waButton = buttons.find((b) => b.textContent?.includes('WhatsApp'))
    expect(waButton).toBeDefined()
  })

  it('tracks WhatsApp click from navbar', () => {
    renderNavbar()
    const buttons = screen.getAllByRole('button')
    const waButton = buttons.find((b) => b.textContent?.includes('WhatsApp'))
    if (waButton) fireEvent.click(waButton)
    expect(mocks.track).toHaveBeenCalledWith('whatsapp_click', { position: 'navbar' })
  })
})
