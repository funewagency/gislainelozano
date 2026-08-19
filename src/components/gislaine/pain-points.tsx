'use client';

import { useRef, useEffect } from 'react';
import { useCmsData } from '@/hooks/use-cms-data';
import { motion, useInView } from 'framer-motion';
import { C, headingFont, bodyFont } from './constants';
import { trackSectionView } from '@/lib/analytics';

const BULLET_ICON = '/images/gislaine/logo-icon-only.png';

export function PainSection() {
  const { data } = useCmsData();
  const { painPoints } = data;

  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (isInView) {
      trackSectionView('para-quem-e');
    }
  }, [isInView]);

  return (
    <section
      ref={ref}
      id="para-quem"
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ backgroundColor: C.base }}
    >
      <div
        className="absolute top-0 right-0 w-[300px] h-[300px] opacity-[0.05]"
        style={{
          background: 'radial-gradient(circle, rgba(223,130,60,1) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[250px] h-[250px] opacity-[0.04]"
        style={{
          background: 'radial-gradient(circle, rgba(25,57,108,0.6) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-[2px] w-16" style={{ backgroundColor: C.accent }} />
            <span
              className="text-[13px] uppercase tracking-[0.25em] font-semibold"
              style={{ fontFamily: 'var(--font-jakarta)', color: C.accent }}
            >
              {painPoints.eyebrow || 'Para Quem É'}
            </span>
            <div className="h-[2px] w-16" style={{ backgroundColor: C.accent }} />
          </div>
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight font-bold text-balance"
            style={{ ...headingFont, color: C.primary }}
            initial={{ opacity: 0, y: 28 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Para quem é essa mentoria?
          </motion.h2>
        </motion.div>

        {painPoints.bullets.length > 0 ? (
          <ul className="space-y-8 mb-20">
            {painPoints.bullets.map((text, index) => (
              <motion.li
                key={index}
                className="flex items-start gap-5 group"
                initial={{ opacity: 0, x: -40 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.15, ease: 'easeOut' }}
              >
                <div className="shrink-0 mt-1">
                  <img
                    src={BULLET_ICON}
                    alt=""
                    className="w-10 h-10 transition-all duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <p
                  className="text-lg md:text-xl lg:text-2xl leading-relaxed pt-1 font-medium break-words"
                  style={{ fontFamily: 'var(--font-jakarta)', color: C.text }}
                >
                  {text}
                </p>
              </motion.li>
            ))}
          </ul>
        ) : (
          <div className="text-center mb-20 py-12">
            <p
              className="text-base leading-relaxed"
              style={{ ...bodyFont, color: C.muted }}
            >
              Nenhum item disponível no momento.
            </p>
          </div>
        )}

        <motion.div
          className="relative py-8 md:py-12 px-6 md:px-8 lg:px-16 text-center lg:text-left overflow-hidden rounded-2xl"
          style={{ backgroundColor: C.primary }}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <div
            className="absolute top-0 right-0 w-64 h-64 opacity-10"
            style={{
              background: 'radial-gradient(circle, rgba(223,130,60,0.5) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />

          <div
            className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ backgroundColor: C.accent }}
          />
          <div className="relative z-10">
            <p
              className="text-2xl md:text-3xl lg:text-4xl leading-snug"
              style={{ fontFamily: 'var(--font-outfit)', color: C.white }}
            >
              {painPoints.calloutText || 'Se você se identifica,'}
              <br />
              <span style={{ color: C.accent }}>
                {painPoints.calloutEmphasis || 'é porque está na hora de mudar.'}
              </span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
