'use client';

import { useRef } from 'react';
import { useCmsData } from '@/hooks/use-cms-data';
import { motion, useInView } from 'framer-motion';
import { C, headingFont, bodyFont } from './constants';
import { MessageCircle, Check } from 'lucide-react';
import { track, trackSectionView } from '@/lib/analytics';
import { RenderContent } from '@/lib/html-render';
import { WhatsAppLeadModal } from './whatsapp-lead-modal';
import { useState } from 'react';

export function ServicesSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data } = useCmsData();
  const { services, navbar } = data;

  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  if (isInView) {
    trackSectionView('servicos');
  }

  return (
    <section
      ref={ref}
      id="servicos"
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ backgroundColor: C.base }}
    >
      <WhatsAppLeadModal open={modalOpen} onClose={() => setModalOpen(false)} source="services-global" />
      <div
        className="absolute top-0 right-0 w-[400px] h-[400px]"
        style={{
          background: 'radial-gradient(circle, rgba(223,130,60,0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[300px] h-[300px]"
        style={{
          background: 'radial-gradient(circle, rgba(25,57,108,0.04) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="relative max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center mb-16 lg:mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div
              className="h-[2px] w-16"
              style={{ backgroundColor: C.accent }}
            />
            <span
              className="text-[13px] uppercase tracking-[0.25em] font-semibold"
              style={{ ...bodyFont, color: C.accent }}
            >
              {services.eyebrow}
            </span>
            <div
              className="h-[2px] w-16"
              style={{ backgroundColor: C.accent }}
            />
          </div>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl leading-tight font-bold"
            style={{ ...headingFont, color: C.primary }}
          >
            <RenderContent content={services.titleHtml} />
          </h2>
        </motion.div>

        <div className="flex flex-col gap-8">
          {services.items.map((service, index) => (
            <motion.div
              key={service.id}
              className="group relative rounded-2xl overflow-hidden transition-all duration-500 cursor-default"
              style={{
                backgroundColor: C.white,
                boxShadow:
                  '0 1px 3px rgba(26,28,32,0.04), 0 4px 12px rgba(26,28,32,0.03)',
              }}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.12 }}
              whileHover={{
                y: -6,
                boxShadow:
                  '0 20px 60px rgba(223,130,60,0.15), 0 8px 24px rgba(26,28,32,0.06)',
              }}
            >
              <div
                className="h-[3px] w-full transition-all duration-500 group-hover:opacity-100"
                style={{ backgroundColor: C.cta, opacity: 0.6 }}
              />

              <div className="p-6 sm:p-8 lg:p-10">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-5 mb-5">
                  <span
                    className="text-3xl sm:text-4xl leading-none shrink-0"
                    style={{
                      ...headingFont,
                      color: C.accent,
                      fontWeight: 700,
                      opacity: 0.85,
                    }}
                  >
                    {service.number}
                  </span>

                  <div className="flex-1">
                    <h3
                      className="text-xl sm:text-2xl leading-snug mb-2"
                      style={{ ...headingFont, color: C.primary, fontWeight: 700 }}
                    >
                      {service.title}
                    </h3>
                    {service.subtitle && (
                      <p
                        className="text-sm sm:text-base leading-relaxed"
                        style={{ ...bodyFont, color: C.accent, fontWeight: 500 }}
                      >
                        {service.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div
                  className="text-sm sm:text-base leading-relaxed mb-6 max-w-3xl"
                  style={{ ...bodyFont, color: C.muted }}
                >
                  <RenderContent content={service.description} />
                </div>

                {service.includes && service.includes.length > 0 && (
                  <div className="mb-6 p-5 rounded-xl" style={{ backgroundColor: 'rgba(223,130,60,0.06)' }}>
                    <p
                      className="text-xs uppercase tracking-[0.2em] mb-3"
                      style={{ ...bodyFont, color: C.accent, fontWeight: 600 }}
                    >
                      O que está incluso:
                    </p>
                    <ul className="space-y-2.5">
                      {service.includes.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                            style={{ backgroundColor: 'transparent' }}
                          >
                            <img src="/images/gislaine/logo-icon-only.png" alt="" className="w-5 h-5" />
                          </div>
                          <span
                            className="text-sm leading-snug"
                            style={{ ...bodyFont, color: C.muted }}
                          >
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-semibold transition-all duration-300"
                  style={{ ...bodyFont, backgroundColor: C.cta, color: C.white, borderRadius: 0 }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = C.white;
                    e.currentTarget.style.color = C.primary;
                    e.currentTarget.style.boxShadow = `inset 0 0 0 2px ${C.accent}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = C.accent;
                    e.currentTarget.style.color = C.white;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onClick={() => {
                    track('service_interest', { service: service.title });
                    setModalOpen(true);
                  }}
                >
                  <MessageCircle size={16} strokeWidth={2} />
                  {service.ctaText}
                </button>
              </div>

              <div
                className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500"
                style={{ backgroundColor: C.accent }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
