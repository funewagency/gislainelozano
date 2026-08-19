'use client';

import { useRef } from 'react';
import { useCmsData } from '@/hooks/use-cms-data';
import { motion, useInView } from 'framer-motion';
import { C, headingFont, bodyFont } from './constants';
import { RenderContent } from '@/lib/html-render';
import { trackSectionView } from '@/lib/analytics';

export function PosicionamentoSection() {
  const { data } = useCmsData();
  const { positioning } = data;

  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  if (isInView) {
    trackSectionView('posicionamento');
  }

  return (
    <section
      ref={ref}
      id="posicionamento"
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ backgroundColor: C.primary, color: C.white }}
    >
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(223,130,60,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(223,130,60,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div
        className="absolute top-1/3 left-0 w-[500px] h-[500px] opacity-[0.05]"
        style={{
          background: 'radial-gradient(circle, rgba(223,130,60,0.4) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        className="absolute bottom-1/4 right-0 w-[400px] h-[400px] opacity-[0.04]"
        style={{
          background: 'radial-gradient(circle, rgba(223,130,60,0.35) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ backgroundColor: 'rgba(223,130,60,0.2)' }}
      />

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
          <div
            className="h-[2px] w-16"
            style={{ backgroundColor: C.accent }}
          />
          <span
            className="text-[13px] uppercase tracking-[0.25em] font-semibold"
            style={{ ...bodyFont, color: C.accent }}
          >
            {positioning.eyebrow}
          </span>
          <div
            className="h-[2px] w-16"
            style={{ backgroundColor: C.accent }}
          />
        </motion.div>

        <motion.h2
          className="text-4xl md:text-5xl lg:text-6xl leading-tight mb-12"
          style={{ ...headingFont, fontWeight: 800, letterSpacing: '-0.02em' }}
          initial={{ opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <RenderContent content={positioning.titleHtml} />
        </motion.h2>

        <motion.p
          className="text-base md:text-lg leading-relaxed mb-8"
          style={{ ...bodyFont, color: 'rgba(255,255,255,0.62)' }}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          {positioning.paragraph1}
        </motion.p>

        <motion.div
          className="flex items-center justify-center gap-3 my-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <div
            className="h-px w-8"
            style={{ backgroundColor: 'rgba(223,130,60,0.25)' }}
          />
          <div
            className="w-1.5 h-1.5 rotate-45"
            style={{ backgroundColor: C.accent, opacity: 0.6 }}
          />
          <div
            className="h-px w-8"
            style={{ backgroundColor: 'rgba(223,130,60,0.25)' }}
          />
        </motion.div>

        <motion.p
          className="text-xl md:text-2xl lg:text-3xl leading-snug mb-10 font-medium"
          style={{ ...headingFont, color: 'rgba(255,255,255,0.88)' }}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          Na prática, isso quer dizer que{' '}
          <span className="font-semibold" style={{ color: C.accent }}>
            {positioning.emphasisText}
          </span>
        </motion.p>

        <motion.div
          className="flex items-center justify-center gap-3 my-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div
            className="h-px w-8"
            style={{ backgroundColor: 'rgba(223,130,60,0.25)' }}
          />
          <div
            className="w-1.5 h-1.5 rotate-45"
            style={{ backgroundColor: C.accent, opacity: 0.6 }}
          />
          <div
            className="h-px w-8"
            style={{ backgroundColor: 'rgba(223,130,60,0.25)' }}
          />
        </motion.div>

        <motion.p
          className="text-base md:text-lg leading-relaxed"
          style={{ ...bodyFont, color: 'rgba(255,255,255,0.62)' }}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.55 }}
        >
          {positioning.paragraph2}
        </motion.p>

        <motion.div
          className="mt-16 flex justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <div
            className="h-[2px] w-24 rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${C.accent}, transparent)`,
              opacity: 0.4,
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}
