'use client';

import { useCmsData } from '@/hooks/use-cms-data';
import { C, headingFont, bodyFont } from './constants';
import { track } from '@/lib/analytics';

export function Footer() {
  const { data } = useCmsData();
  const { footer } = data;

  return (
    <footer
      className="relative py-12 border-t"
      style={{ backgroundColor: C.primary, borderColor: 'rgba(223,130,60,0.15)' }}
    >
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background: 'linear-gradient(180deg, rgba(25,57,108,0) 0%, rgba(25,57,108,1) 100%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <img
              src={footer.logoUrl}
              alt="Gislaine Lozano"
              className="h-7 w-auto"
            />
            <span
              className="text-xs tracking-[0.2em]"
              style={{ ...headingFont, color: 'rgba(255,255,255,0.7)' }}
            >
              {footer.brandName}
            </span>
          </div>

          <div className="flex items-center gap-8">
            {footer.links.map((link) => (
              <a
                key={link.id}
                href={link.sectionId}
                className="text-[10px] uppercase tracking-[0.2em] transition-colors no-underline hover:text-[#DF823C]"
                style={{ ...bodyFont, color: 'rgba(255,255,255,0.4)' }}
                onClick={() => track('navbar_link_click', { target: link.label })}
              >
                {link.label}
              </a>
            ))}
          </div>

          <p
            className="text-[10px] uppercase tracking-[0.2em]"
            style={{ ...bodyFont, color: 'rgba(255,255,255,0.2)' }}
          >
            {footer.copyrightText}
          </p>
        </div>
      </div>
    </footer>
  );
}
