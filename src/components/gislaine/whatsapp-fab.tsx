'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, ArrowUp } from 'lucide-react';
import { C } from './constants';
import { useWhatsAppModal } from './whatsapp-context';

export function WhatsAppFab() {
  const [show, setShow] = useState(false);
  const { openModal } = useWhatsAppModal();

  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <button
        onClick={scrollToTop}
        className="w-12 h-12 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110"
        style={{
          border: '1px solid rgba(223,130,60,0.3)',
          backgroundColor: C.primary,
          color: C.accent,
        }}
        aria-label="Voltar ao topo"
      >
        <ArrowUp size={18} />
      </button>

      <button
        onClick={() => openModal('fab')}
        className="w-12 h-12 flex items-center justify-center shadow-lg animate-pulse-glow hover:scale-110 transition-transform duration-200"
        style={{
          backgroundColor: C.whatsapp,
          color: C.white,
          borderRadius: '50%',
        }}
        aria-label="Contato via WhatsApp"
      >
        <MessageCircle size={22} />
      </button>
    </div>
  );
}
