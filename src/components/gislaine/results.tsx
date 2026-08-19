'use client';

import { useRef, useState } from 'react';
import { useCmsData } from '@/hooks/use-cms-data';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { C, headingFont, bodyFont } from './constants';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { track, trackSectionView } from '@/lib/analytics';
import { RenderContent } from '@/lib/html-render';
import { WhatsAppLeadModal } from './whatsapp-lead-modal';

export function ResultsSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data } = useCmsData();
  const { testimonials } = data;

  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [current, setCurrent] = useState(0);

  if (isInView) {
    trackSectionView('resultados');
  }

  const next = () => {
    track('testimonial_nav', { direction: 'next' });
    setCurrent((prev) => (prev + 1) % testimonials.items.length);
  };

  const prev = () => {
    track('testimonial_nav', { direction: 'prev' });
    setCurrent((prev) => (prev - 1 + testimonials.items.length) % testimonials.items.length);
  };

  if (testimonials.items.length === 0) return null;

  const clampedCurrent = Math.min(current, testimonials.items.length - 1);
  if (clampedCurrent !== current) setCurrent(clampedCurrent);

  const activeTestimonial = testimonials.items[clampedCurrent];

  return (
    <section
      ref={ref}
      id="resultados"
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ backgroundColor: C.base }}
    >
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-[0.03]"
        style={{
          background: 'radial-gradient(circle, rgba(223,130,60,0.5) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-[2px] w-16" style={{ backgroundColor: C.accent }} />
            <span
              className="text-[13px] uppercase tracking-[0.25em] font-semibold"
              style={{ ...bodyFont, color: C.accent }}
            >
              {testimonials.eyebrow}
            </span>
            <div className="h-[2px] w-16" style={{ backgroundColor: C.accent }} />
          </div>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl mb-4 font-bold"
            style={{ ...headingFont, color: C.primary }}
          >
            <RenderContent content={testimonials.titleHtml} />
          </h2>
          <p
            className="text-base md:text-lg max-w-xl mx-auto"
            style={{ ...bodyFont, color: C.muted }}
          >
            {testimonials.description}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="relative max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                className="relative p-8 lg:p-12 border"
                style={{
                  borderColor: 'rgba(26,28,32,0.08)',
                  backgroundColor: C.white,
                }}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4 }}
              >
                <Quote
                  size={32}
                  className="mb-4"
                  style={{ color: C.accent, opacity: 0.3 }}
                />

                <div
                  className="mb-8 max-h-64 overflow-y-auto custom-scrollbar"
                  style={{ ...bodyFont, color: C.text }}
                >
                  {activeTestimonial.paragraphs.map((p, i) => (
                    <p
                      key={p.id}
                      className="text-[13px] lg:text-sm leading-[1.55]"
                      style={{ marginBottom: i < activeTestimonial.paragraphs.length - 1 ? '0.75em' : 0 }}
                    >
                      {i === 0 && '\u201C'}{p.text}{i === activeTestimonial.paragraphs.length - 1 && '\u201D'}
                    </p>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: C.cta, color: C.white }}
                  >
                    {activeTestimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ ...bodyFont, color: C.text }}
                    >
                      {activeTestimonial.name}
                    </p>
                    {activeTestimonial.role && (
                      <p className="text-xs" style={{ ...bodyFont, color: C.muted }}>
                        {activeTestimonial.role}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={prev}
                className="w-10 h-10 border flex items-center justify-center transition-colors cursor-pointer"
                style={{ borderColor: 'rgba(26,28,32,0.1)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = C.accent;
                  e.currentTarget.style.color = C.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(26,28,32,0.1)';
                  e.currentTarget.style.color = C.text;
                }}
                aria-label="Depoimento anterior"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex gap-2">
                {testimonials.items.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      track('testimonial_nav', { direction: 'dot', index: i });
                      setCurrent(i);
                    }}
                    className="w-2 h-2 rounded-full transition-all cursor-pointer"
                    style={{
                      backgroundColor: i === current ? C.accent : 'rgba(26,28,32,0.15)',
                      transform: i === current ? 'scale(1.3)' : 'scale(1)',
                    }}
                    aria-label={`Ir para depoimento ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={next}
                className="w-10 h-10 border flex items-center justify-center transition-colors cursor-pointer"
                style={{ borderColor: 'rgba(26,28,32,0.1)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = C.accent;
                  e.currentTarget.style.color = C.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(26,28,32,0.1)';
                  e.currentTarget.style.color = C.text;
                }}
                aria-label="Próximo depoimento"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
