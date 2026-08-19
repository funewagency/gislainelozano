// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const mockOpenModal = vi.fn();

vi.mock('./whatsapp-context', () => ({
  useWhatsAppModal: () => ({ openModal: mockOpenModal }),
}));

import { WhatsAppFab } from './whatsapp-fab';

describe('WhatsAppFab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a floating button when scrolled', () => {
    render(<WhatsAppFab />);
    window.scrollY = 400;
    fireEvent.scroll(window);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('opens modal on WhatsApp button click', () => {
    render(<WhatsAppFab />);
    window.scrollY = 400;
    fireEvent.scroll(window);
    const waBtn = screen.getByLabelText('Contato via WhatsApp');
    fireEvent.click(waBtn);
    expect(mockOpenModal).toHaveBeenCalledWith('fab');
  });
});
