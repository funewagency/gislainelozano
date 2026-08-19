'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { WhatsAppLeadModal } from '@/components/gislaine/whatsapp-lead-modal';
import { useCmsEditor } from '@/lib/cms-store';

interface WhatsAppContextType {
  openModal: (source: string) => void;
  closeModal: () => void;
  config: any;
}

const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined);

const TRIGGERED_KEY = 'whatsappModalTriggered';

function isAdminRoute(pathname: string | null): boolean {
  return !!pathname && pathname.startsWith('/admin');
}

export function WhatsAppProvider({ children }: { children: ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [source, setSource] = useState('whatsapp-fab');
  const pathname = usePathname();
  const cmsData = useCmsEditor(s => s.data);
  const config = cmsData?.whatsappModal;
  const inAdmin = isAdminRoute(pathname);

  const openModal = (source: string) => {
    setSource(source);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  // Abertura automática após delay (uma vez por sessão) — exceto no admin
  useEffect(() => {
    if (inAdmin) return;
    if (!config?.triggerDelay || config.triggerDelay <= 0) return;
    if (typeof window === 'undefined') return;
    if (window.sessionStorage.getItem(TRIGGERED_KEY)) return;

    const timer = window.setTimeout(() => {
      window.sessionStorage.setItem(TRIGGERED_KEY, 'true');
      openModal('trigger-delay');
    }, config.triggerDelay);

    return () => window.clearTimeout(timer);
  }, [config?.triggerDelay, inAdmin]);

  // Intenção de saída — exceto no admin
  useEffect(() => {
    if (inAdmin) return;
    if (!config?.showOnExitIntent) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) openModal('exit-intent');
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [config?.showOnExitIntent, inAdmin]);

  return (
    <WhatsAppContext.Provider value={{ openModal, closeModal, config }}>
      {children}
      <WhatsAppLeadModal
        open={modalOpen}
        onClose={closeModal}
        source={source}
      />
    </WhatsAppContext.Provider>
  );
}

export function useWhatsAppModal() {
  const context = useContext(WhatsAppContext);
  if (!context) throw new Error('useWhatsAppModal must be used within WhatsAppProvider');
  return context;
}
