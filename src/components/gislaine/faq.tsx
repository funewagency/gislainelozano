'use client';

import { useRef, useState } from 'react';
import { useCmsData } from '@/hooks/use-cms-data';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { C, headingFont, bodyFont } from './constants';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { track, trackSectionView } from '@/lib/analytics';
import { RenderContent } from '@/lib/html-render';
import { WhatsAppLeadModal } from './whatsapp-lead-modal';

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-6 text-left cursor-pointer group"
      >
        <span
          className="text-base md:text-lg pr-6 transition-colors"
          style={{ ...bodyFont, color: isOpen ? C.accent : C.white }}
        >
          {question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0"
        >
          <ChevronDown
            size={20}
            style={{ color: isOpen ? C.accent : 'rgba(255,255,255,0.4)' }}
          />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div
              className="pb-6 text-sm md:text-base leading-relaxed"
              style={{ ...bodyFont, color: 'rgba(255,255,255,0.6)' }}
            >
              <RenderContent content={answer} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FaqSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data } = useCmsData();
  const { faq, navbar } = data;

  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  if (isInView) {
    trackSectionView('faq');
  }

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
    track('faq_toggled', {
      question: faq.items[index].question,
      action: openIndex === index ? 'close' : 'open',
    });
  };

  return (
    <section
      ref={ref}
      id="faq"
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ backgroundColor: C.primary }}
    >
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] opacity-[0.04]"
        style={{
          background: 'radial-gradient(circle, rgba(223,130,60,0.5) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[300px] h-[300px] opacity-[0.03]"
        style={{
          background: 'radial-gradient(circle, rgba(223,130,60,0.4) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-3xl mx-auto px-6">
        <WhatsAppLeadModal open={modalOpen} onClose={() => setModalOpen(false)} source="faq" />
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
              {faq.eyebrow}
            </span>
            <div className="h-[2px] w-16" style={{ backgroundColor: C.accent }} />
          </div>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl mb-4 font-bold"
            style={{ ...headingFont, color: C.white }}
          >
            <RenderContent content={faq.titleHtml} />
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {faq.items.map((item, index) => (
            <FaqItem
              key={item.id}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </motion.div>

        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <p
            className="text-base mb-8"
            style={{ ...bodyFont, color: 'rgba(255,255,255,0.5)' }}
          >
            {faq.footerCtaQuestion}
          </p>
          <button
            className="inline-flex items-center gap-3 px-10 py-5 text-lg font-semibold transition-all hover:brightness-110 hover:shadow-lg cursor-pointer"
            style={{ backgroundColor: C.cta, color: C.white, borderRadius: 0, ...bodyFont }}
            onClick={() => setModalOpen(true)}
          >
            <MessageCircle size={22} />
            {faq.footerCtaButtonText}
          </button>
        </motion.div>
      </div>
    </section>
  );
}
