"use client";

import { useRef } from "react";
import { useCmsData } from "@/hooks/use-cms-data";
import { motion, useInView } from "framer-motion";
import { C, headingFont, bodyFont } from "./constants";
import { trackSectionView } from "@/lib/analytics";
import { RenderContent } from "@/lib/html-render";
import { BioOverlay } from "./BioOverlay";

export function BioSection() {
  const { data } = useCmsData();
  const { bio } = data;

  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  if (isInView) {
    trackSectionView("sobre-mim");
  }

  return (
    <section
      ref={ref}
      id="sobre"
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ backgroundColor: C.base }}
    >
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full"
        style={{ backgroundColor: "rgba(26,28,32,0.04)" }}
      />

      <div
        className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.04]"
        style={{
          background:
            "radial-gradient(circle, rgba(223,130,60,0.4) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-5">
              <div
                className="h-[2px] w-16"
                style={{ backgroundColor: C.accent }}
              />
              <span
                className="text-xs sm:text-[13px] uppercase tracking-[0.25em] font-semibold"
                style={{ ...bodyFont, color: C.accent }}
              >
                {bio.eyebrow}
              </span>
            </div>

            <h2
              className="text-2xl sm:text-3xl lg:text-4xl mb-6 leading-[1.2] font-bold tracking-tight text-balance"
              style={{ ...headingFont, color: C.primary }}
            >
              <RenderContent content={bio.titleHtml} />
            </h2>

            <div
              className="space-y-4 mb-8 text-base sm:text-lg leading-relaxed font-normal"
              style={{ ...bodyFont, color: C.muted }}
            >
              {bio.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <div className="mb-8">
              <p
                className="text-xs sm:text-[13px] uppercase tracking-[0.2em] font-bold mb-4"
                style={{ ...bodyFont, color: C.accent }}
              >
                Meu percurso profissional
              </p>

              <ul className="space-y-3.5">
                {bio.careerPath.map((item, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -16 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.5 + i * 0.08 }}
                  >
                    <span
                      className="mt-2 shrink-0 w-2 h-2 rounded-full"
                      style={{ backgroundColor: C.accent }}
                    />
                    <span
                      className="text-sm sm:text-base leading-relaxed font-medium"
                      style={{ ...bodyFont, color: C.text }}
                    >
                      {item}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <motion.div className="relative pl-5 py-3 border-l-2 rounded-r-xl" style={{ borderColor: C.accent, backgroundColor: 'rgba(223,130,60,0.04)' }}>
              <motion.p
                className="leading-relaxed text-sm sm:text-base"
                style={{ ...bodyFont, color: C.muted }}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                Ao longo dos últimos anos, acompanhei empresas que cresceram,
                escalaram e também muitas que travaram nas vendas por erros
                simples de comunicação. E um deles aparece o tempo todo:{' '}
                <strong style={{ color: C.primary }} className="font-semibold">
                  atendimento mal estruturado.
                </strong>
              </motion.p>
            </motion.div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.div
              className="absolute top-[8px] left-[8px] w-[calc(100%-8px)] h-[calc(100%-8px)] rounded-3xl"
              style={{ backgroundColor: C.accent, opacity: 0.85 }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 0.85, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
            />

            <div
              className="relative overflow-hidden rounded-3xl"
              style={{
                aspectRatio: "2/3",
                boxShadow: `
                  0 4px 12px rgba(25,57,108,0.18),
                  0 12px 36px rgba(25,57,108,0.12),
                  0 24px 60px rgba(25,57,108,0.08)
                `,
              }}
            >
              <img
                src={bio.portraitImageUrl}
                alt="Gislaine Lozano"
                className="w-full h-full object-cover object-top"
              />

              {/* Degradê apenas na base inferior para contraste suave do badge */}
              <div
                className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
                style={{
                  background: 'linear-gradient(to top, rgba(25,57,108,0.7) 0%, rgba(25,57,108,0.15) 60%, transparent 100%)',
                }}
              />
            </div>

            <BioOverlay 
              name={bio.overlayName} 
              role={bio.overlayRole} 
              isInView={isInView} 
            />

            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rotate-45 border z-10"
              style={{ backgroundColor: C.base, borderColor: C.accent }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
