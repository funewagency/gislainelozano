// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const mockClose = vi.fn();

vi.mock('./whatsapp-context', () => ({
  useWhatsAppModal: () => ({
    config: {
      title: 'Fale Conosco',
      message: 'Olá! Gostaria de saber mais sobre seus serviços.',
      buttonText: 'Abrir WhatsApp',
      phoneNumber: '5511999999999',
      triggerDelay: 5000,
      showOnExitIntent: true,
    },
  }),
}));

vi.mock('@/lib/analytics', () => ({
  track: vi.fn(),
}));

vi.mock('@/lib/use-lead-persistence', () => ({
  getLeadData: () => ({ name: '', email: '', phone: '' }),
  saveLeadData: vi.fn(),
}));

vi.mock('@/lib/use-marketing-attribution', () => ({
  getMarketingAttribution: () => ({ source: null, medium: null, campaign: null }),
}));

import { WhatsAppLeadModal } from './whatsapp-lead-modal';

describe('WhatsAppLeadModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-ignore - jsdom stub
    delete window.location;
    // @ts-ignore - jsdom stub
    window.location = { href: '' } as Location;
  });

  it('renders nothing when closed', () => {
    const { container } = render(<WhatsAppLeadModal open={false} onClose={mockClose} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders form when open', () => {
    render(<WhatsAppLeadModal open={true} onClose={mockClose} />);
    expect(screen.getByText('Fale Conosco')).toBeDefined();
    expect(screen.getByText(/gostaria de saber mais/i)).toBeDefined();
    expect(screen.getByText('Abrir WhatsApp')).toBeDefined();
    expect(screen.getByLabelText('Nome')).toBeDefined();
    expect(screen.getByLabelText('E-mail')).toBeDefined();
    expect(screen.getByLabelText('WhatsApp')).toBeDefined();
  });

  it('renders close button', () => {
    render(<WhatsAppLeadModal open={true} onClose={mockClose} />);
    const closeBtn = screen.getByRole('button', { name: /fechar/i });
    fireEvent.click(closeBtn);
    expect(mockClose).toHaveBeenCalledOnce();
  });
});
