// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, screen, fireEvent } from '@testing-library/react';

vi.mock('@/lib/cms-store', () => ({
  useCmsEditor: (selector: (s: any) => any) => {
    const state = {
      data: {
        whatsappModal: {
          title: 'Fale Conosco',
          message: 'Olá!',
          buttonText: 'Abrir WhatsApp',
          phoneNumber: '5511999999999',
          triggerDelay: 100,
          showOnExitIntent: true,
        },
      },
    };
    return selector(state);
  },
}));

const mockUsePathname = vi.fn(() => '/');

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

vi.mock('@/components/gislaine/whatsapp-lead-modal', () => ({
  WhatsAppLeadModal: ({ open, onClose }: any) =>
    open ? <div data-testid="mock-modal"><button data-testid="modal-close" onClick={onClose}>Close</button></div> : null,
}));

import { WhatsAppProvider, useWhatsAppModal } from './whatsapp-context';

function TestConsumer() {
  const { openModal, closeModal, config } = useWhatsAppModal();
  return (
    <div>
      <span data-testid="title">{config.title}</span>
      <button data-testid="open-btn" onClick={() => openModal('test')}>Open</button>
    </div>
  );
}

describe('WhatsAppProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('provides config from CMS store', () => {
    render(
      <WhatsAppProvider>
        <TestConsumer />
      </WhatsAppProvider>,
    );
    expect(screen.getByTestId('title').textContent).toBe('Fale Conosco');
  });

  it('shows modal when openModal is called', () => {
    render(
      <WhatsAppProvider>
        <TestConsumer />
      </WhatsAppProvider>,
    );
    expect(screen.queryByTestId('mock-modal')).toBeNull();
    fireEvent.click(screen.getByTestId('open-btn'));
    expect(screen.getByTestId('mock-modal')).toBeDefined();
  });

  it('closes modal via onClose callback', () => {
    render(
      <WhatsAppProvider>
        <TestConsumer />
      </WhatsAppProvider>,
    );
    fireEvent.click(screen.getByTestId('open-btn'));
    expect(screen.getByTestId('mock-modal')).toBeDefined();
    fireEvent.click(screen.getByTestId('modal-close'));
    expect(screen.queryByTestId('mock-modal')).toBeNull();
  });

  it('opens modal automatically after triggerDelay', async () => {
    render(
      <WhatsAppProvider>
        <TestConsumer />
      </WhatsAppProvider>,
    );
    expect(screen.queryByTestId('mock-modal')).toBeNull();
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.getByTestId('mock-modal')).toBeDefined();
  });

  it('does not auto-open in admin routes', () => {
    mockUsePathname.mockReturnValue('/admin/dashboard/content');
    render(
      <WhatsAppProvider>
        <TestConsumer />
      </WhatsAppProvider>,
    );
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.queryByTestId('mock-modal')).toBeNull();
    mockUsePathname.mockReturnValue('/');
  });
});
