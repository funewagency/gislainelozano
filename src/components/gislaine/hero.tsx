'use client';

import { useCmsData } from '@/hooks/use-cms-data';
import { C, headingFont, bodyFont, NAV_HEIGHT } from './constants';
import { useRef } from 'react';
import { MessageCircle, ChevronDown } from 'lucide-react';
import { track, trackSectionView, trackWhatsAppClick } from '@/lib/analytics';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { RenderContent } from '@/lib/html-render';
import { useWhatsAppModal } from './whatsapp-context';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

export function HeroSection() {
  const { openModal } = useWhatsAppModal();
  const { data } = useCmsData();
  const { hero, navbar } = data;

  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], [0, 200]);

  if (isInView) {
    trackSectionView('hero');
  }

  return (
    <header
      ref={ref}
      className="relative overflow-hidden"
      style={{ backgroundColor: C.primary, height: '100vh', maxHeight: '100vh' }}
    >
      {/* MOBILE */}
      <div className="sm:hidden relative h-full">
        <div className="absolute inset-0 z-0">
          <img
            src={hero.mobileImageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-contain object-top"
            style={{ objectPosition: 'center top', backgroundColor: C.primary }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 60% 50% at 50% 25%, rgba(223,130,60,0.06) 0%, transparent 70%), radial-gradient(circle at 80% 80%, rgba(25,57,108,0.2) 0%, transparent 60%)',
            }}
          />
        </div>

        <motion.div
          className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-8 pt-16"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(25,57,108,0.4) 20%, rgba(25,57,108,0.85) 50%, #19396C 100%)',
          }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <h1
              className="text-[20px] leading-[1.15] mb-3"
              style={{ ...headingFont, color: C.white, fontWeight: 400 }}
            >
              <RenderContent content={hero.titleHtml} />
            </h1>
          </motion.div>

          <motion.div variants={itemVariants}>
            <p
              className="text-[11px] leading-relaxed mb-4"
              style={{ ...bodyFont, color: 'rgba(255,255,255,0.75)' }}
            >
              {hero.description}
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <button
                className="flex items-center justify-center gap-2 px-4 py-2 border transition-all duration-300 hover:scale-105 cursor-pointer"
                style={{
                  ...headingFont,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderColor: C.accent,
                  color: C.white,
                  borderRadius: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = C.accent;
                  e.currentTarget.style.color = C.white;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = C.white;
                }}
                onClick={() => {
                  trackWhatsAppClick('hero');
                  openModal('hero');
                }}
              >
              <MessageCircle size={14} />
              {hero.ctaText}
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* TABLET+ DESKTOP */}
      <div className="hidden sm:block relative overflow-hidden h-full">
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Cinematic portrait reveal — rises from bottom with depth */}
          <motion.div
            className="absolute inset-0 w-full h-full will-change-transform"
            initial={{ scale: 1.08, clipPath: 'inset(100% 0% 0% 0%)' }}
            animate={isInView ? {
              scale: 1,
              clipPath: 'inset(0% 0% 0% 0%)',
            } : {}}
            transition={{
              scale: { duration: 1.5, ease: [0.16, 1, 0.3, 1] },
              clipPath: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
            }}
          >
            <motion.div style={{ y }} className="absolute inset-0 w-full h-full">
              <img
                src={hero.desktopImageUrl}
                alt=""
                className="w-full h-full object-cover object-right"
                fetchPriority="high"
              />
            </motion.div>
          </motion.div>

          {/* Warm blend overlay — fades out as portrait reveals, creating depth */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0.35 }}
            animate={isInView ? { opacity: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.25, ease: 'easeOut' }}
            style={{
              background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(223,130,60,0.15) 0%, transparent 70%), radial-gradient(circle at 20% 80%, rgba(25,57,108,0.35) 0%, transparent 50%)',
            }}
          />

          {/* Ambient atmosphere gradients */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 50% 60% at 70% 40%, rgba(223,130,60,0.06) 0%, transparent 70%), radial-gradient(circle at 20% 90%, rgba(25,57,108,0.2) 0%, transparent 50%)',
            }}
          />
        </div>

        <motion.div
          className="relative z-10 max-w-7xl mx-auto w-full flex items-center px-6 sm:px-8 lg:px-10 xl:px-12"
          style={{
            paddingTop: NAV_HEIGHT + 24,
            paddingBottom: 40,
            height: '100vh',
          }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
            <motion.div variants={itemVariants}>
              <h1
                className="text-[26px] md:text-[28px] lg:text-[30px] xl:text-[34px] leading-[1.12] mb-3 sm:mb-4 lg:mb-5"
                style={{ ...headingFont, color: C.white }}
              >
                <RenderContent content={hero.titleHtml} />
              </h1>
            </motion.div>

            <motion.div variants={itemVariants}>
              <p
                className="text-[11px] sm:text-xs lg:text-sm xl:text-base mb-4 sm:mb-5 lg:mb-6 leading-relaxed max-w-lg"
                style={{ ...bodyFont, color: 'rgba(255,255,255,0.75)' }}
              >
                {hero.description}
              </p>
            </motion.div>

              <motion.div variants={itemVariants}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative overflow-hidden group inline-flex items-center justify-center gap-2 sm:gap-3 text-[11px] sm:text-xs lg:text-sm uppercase tracking-[0.15em] font-semibold py-3 sm:py-3.5 lg:py-4 px-6 sm:px-8 lg:px-10 cursor-pointer"
                  style={{ ...bodyFont, backgroundColor: C.cta, color: C.white, borderRadius: 0 }}
                  onClick={() => {
                     trackWhatsAppClick('hero');
                     openModal('hero');
                  }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white opacity-20"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 2, ease: 'linear' }}
                  />
                  <MessageCircle size={16} className="sm:hidden" />
                  <MessageCircle size={18} className="hidden sm:block" />
                  {hero.ctaText}
                </motion.button>
              </motion.div>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
