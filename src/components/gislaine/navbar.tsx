'use client';

import { useEffect, useState } from 'react';
import { useCmsData } from '@/hooks/use-cms-data';
import { C, headingFont, headingFontBold, bodyFont, NAV_HEIGHT } from './constants';
import { Menu, X } from 'lucide-react';
import { track, trackWhatsAppClick } from '@/lib/analytics';
import { useWhatsAppModal } from './whatsapp-context';

export function Navbar() {
  const { openModal } = useWhatsAppModal();
  const { data } = useCmsData();
  const { navbar } = data;

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          backgroundColor: scrolled ? 'rgba(25,57,108,0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(223,130,60,0.15)' : 'none',
        }}
      >
        <div
          className="max-w-7xl mx-auto px-6 flex items-center justify-between"
          style={{ height: NAV_HEIGHT }}
        >
          <a
            href="#"
            className="flex items-center gap-3 no-underline"
          >
            <img
              src={navbar.logoUrl}
              alt="Gislaine Lozano"
              className="h-9 md:h-10 w-auto"
              width={256}
              height={256}
            />
            <span
              className="text-sm md:text-base tracking-[0.15em] text-white"
              style={{ ...headingFontBold }}
            >
              {navbar.brandName}
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navbar.links.map((link) => (
              <a
                key={link.id}
                href={link.sectionId}
                className="text-[11px] uppercase tracking-[0.2em] transition-all duration-300 no-underline hover:text-[#DF823C] focus-visible:text-[#DF823C] active:text-[#DF823C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline"
                style={{ ...bodyFont, color: 'rgba(255,255,255,0.72)', outlineColor: C.accent }}
                onClick={() => track('navbar_link_click', { target: link.label })}
              >
                {link.label}
              </a>
            ))}
            <button
                className="text-[11px] uppercase tracking-[0.2em] py-2 px-5 border no-underline cursor-pointer transition-all duration-300 hover:bg-[#DF823C] hover:text-white hover:border-[#DF823C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline"
                style={{
                  ...bodyFont,
                  backgroundColor: scrolled ? 'transparent' : C.accent,
                  color: scrolled ? C.accent : C.white,
                  borderColor: scrolled ? C.accent : C.accent,
                  outlineColor: C.white,
                }}
                onClick={() => {
                  trackWhatsAppClick('navbar');
                  openModal('navbar');
                }}
              >
              WhatsApp
            </button>
          </div>

          <button
            className="md:hidden text-white cursor-pointer p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline"
            style={{ outlineColor: C.accent }}
            onClick={() => {
              const opening = !mobileOpen
              setMobileOpen(opening)
              track('navbar_link_click', { target: opening ? 'menu-open' : 'menu-close' })
            }}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8"
          style={{ backgroundColor: 'rgba(25,57,108,0.98)' }}
        >
          {navbar.links.map((link) => (
            <a
              key={link.id}
              href={link.sectionId}
              className="text-2xl tracking-[0.15em] text-white no-underline transition-colors duration-300 hover:text-[#DF823C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline"
              style={{ ...headingFont, outlineColor: C.accent }}
              onClick={() => {
                setMobileOpen(false)
                track('navbar_link_click', { target: link.label })
              }}
            >
              {link.label}
            </a>
          ))}
          <button
            className="mt-4 text-sm uppercase tracking-[0.2em] py-3 px-8 border no-underline cursor-pointer transition-all duration-300 hover:bg-white hover:text-[#DF823C] hover:border-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline"
            style={{ ...bodyFont, borderColor: C.cta, backgroundColor: C.cta, color: C.white, outlineColor: C.accent }}
            onClick={() => {
              setMobileOpen(false)
              trackWhatsAppClick('navbar')
              openModal('navbar')
            }}
          >
            WhatsApp
          </button>
        </div>
      )}
    </>
  );
}
