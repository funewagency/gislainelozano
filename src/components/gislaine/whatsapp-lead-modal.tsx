'use client';

import { useState, useEffect, useCallback } from 'react';
import { C } from './constants';
import { getLeadData, saveLeadData } from '@/lib/use-lead-persistence';
import { track } from '@/lib/analytics';
import { getMarketingAttribution } from '@/lib/use-marketing-attribution';
import { Loader2, X } from 'lucide-react';
import { useWhatsAppModal } from './whatsapp-context';

interface WhatsAppLeadModalProps {
  open: boolean;
  onClose: () => void;
  source?: string;
}

export function WhatsAppLeadModal({ open, onClose, source = 'whatsapp-fab' }: WhatsAppLeadModalProps) {
  const { config } = useWhatsAppModal();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      const saved = getLeadData();
      if (saved.name) setName(saved.name);
      if (saved.email) setEmail(saved.email);
      if (saved.phone) setPhone(saved.phone);
      setError('');
      setSubmitted(false);
      track('contact_form_started', { source });
    }
  }, [open, source]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const attribution = getMarketingAttribution();
    const phoneNumber = config?.phoneNumber || '5545988231902';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.replace(/\D/g, ''),
          source: attribution.source || source,
          medium: attribution.medium,
          campaign: attribution.campaign,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao enviar. Tente novamente.');
        track('contact_form_error', { error: data.error, source });
        setLoading(false);
        return;
      }

      saveLeadData({ name: name.trim(), email: email.trim(), phone: phone.replace(/\D/g, '') });
      setSubmitted(true);
      setLoading(false);

      track('contact_form_success', { syncedToCms: data.syncedToCms, source });

      const cleanPhone = phone.replace(/\D/g, '');
      const message = [
        `Olá! Gostaria de saber mais sobre a mentoria.`,
        `Meu nome é ${name.trim()}.`,
        email.trim() && `Meu e-mail é ${email.trim()}.`,
        cleanPhone && `Meu WhatsApp é ${cleanPhone}.`,
      ].filter(Boolean).join(' ');

      const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

      setTimeout(() => {
        // Same-tab navigation lets the browser decide: open the app if installed,
        // otherwise load the wa.me page where the user can continue via web or install.
        window.location.href = url;
        onClose();
      }, 600);
    } catch {
      setError('Erro de conexão. Tente novamente.');
      track('contact_form_error', { error: 'network_error', source });
      setLoading(false);
    }
  }, [name, email, phone, source, onClose, config?.phoneNumber]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div
        className="w-full max-w-md p-6 sm:p-8 relative animate-in fade-in zoom-in-95 duration-200"
        style={{ backgroundColor: C.primary }}
      >
        {/* Close button */}
        <button
          onClick={() => {
            if (!submitted) track('whatsapp_modal_closed', { source })
            onClose()
          }}
          className="absolute top-4 right-4 p-1 transition-opacity hover:opacity-70"
          style={{ color: C.white }}
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <img src="/images/gislaine/logo-icon-only.png" alt="" className="w-12 h-12" />
            </div>
            <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: 'var(--font-outfit)', color: C.white }}>
              Redirecionando...
            </h3>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Você será redirecionado para o WhatsApp em instantes.
            </p>
          </div>
        ) : (
          <>
            <h3
              className="text-xl font-bold mb-1"
              style={{ fontFamily: 'var(--font-outfit)', color: C.white }}
            >
              {config?.title || 'Vamos conversar!'}
            </h3>
            <p className="text-sm mb-6 font-sans" style={{ fontFamily: 'var(--font-jakarta)', color: 'rgba(255,255,255,0.7)' }}>
              {config?.message || 'Deixe seus dados abaixo para conversarmos no WhatsApp.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="lead-name" className="block text-xs font-semibold mb-1 tracking-wider uppercase" style={{ fontFamily: 'var(--font-jakarta)', color: C.white }}>
                  Nome
                </label>
                <input
                  id="lead-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm outline-none focus:border-accent transition-colors font-sans"
                  style={{
                    fontFamily: 'var(--font-jakarta)',
                    border: '1px solid #D1D5DB',
                    color: C.text,
                    backgroundColor: C.white,
                    borderRadius: 0,
                  }}
                  placeholder="Seu nome completo"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="lead-email" className="block text-xs font-semibold mb-1 tracking-wider uppercase" style={{ fontFamily: 'var(--font-jakarta)', color: C.white }}>
                  E-mail
                </label>
                <input
                  id="lead-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm outline-none focus:border-accent transition-colors font-sans"
                  style={{
                    fontFamily: 'var(--font-jakarta)',
                    border: '1px solid #D1D5DB',
                    color: C.text,
                    backgroundColor: C.white,
                    borderRadius: 0,
                  }}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="lead-phone" className="block text-xs font-semibold mb-1 tracking-wider uppercase" style={{ fontFamily: 'var(--font-jakarta)', color: C.white }}>
                  WhatsApp
                </label>
                <input
                  id="lead-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm outline-none focus:border-accent transition-colors font-sans"
                  style={{
                    fontFamily: 'var(--font-jakarta)',
                    border: '1px solid #D1D5DB',
                    color: C.text,
                    backgroundColor: C.white,
                    borderRadius: 0,
                  }}
                  placeholder="(DDD) 99999-9999"
                  required
                />
              </div>

              {error && (
                <p className="text-sm font-medium" style={{ color: C.error }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-sm font-semibold transition-all hover:bg-opacity-90 active:scale-[0.98]"
                style={{
                  backgroundColor: C.accent,
                  color: C.white,
                  borderRadius: 0,
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Enviando...
                  </span>
                ) : (
                  config?.buttonText || 'Falar no WhatsApp'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
