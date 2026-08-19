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
            <div className="flex items-center gap-4 mb-6">
              <div
                className="h-[2px] w-16"
                style={{ backgroundColor: C.accent }}
              />
              <span
                className="text-[13px] uppercase tracking-[0.25em] font-semibold"
                style={{ ...bodyFont, color: C.accent }}
              >
                {bio.eyebrow}
              </span>
            </div>

            <h2
              className="text-4xl md:text-5xl lg:text-6xl mb-8 leading-tight font-bold"
              style={{ ...headingFont, color: C.primary }}
            >
              <RenderContent content={bio.titleHtml} />
            </h2>

            <div
              className="space-y-6 mb-8 text-lg md:text-xl leading-relaxed"
              style={{ ...bodyFont, color: C.muted }}
            >
              {bio.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <div className="mb-8">
              <p
                className="text-[11px] uppercase tracking-[0.3em] mb-5"
                style={{ ...bodyFont, color: C.accent }}
              >
                Meu percurso profissional
              </p>

              <ul className="space-y-3">
                {bio.careerPath.map((item, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -16 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                  >
                    <span
                      className="mt-[7px] shrink-0 w-2 h-2 rounded-full"
                      style={{ backgroundColor: C.accent }}
                    />
                    <span
                      className="text-sm leading-relaxed"
                      style={{ ...bodyFont, color: C.muted }}
                    >
                      {item}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <motion.div className="relative pl-4">
              <div
                className="absolute top-0 left-0 w-[2px] h-full"
                style={{ backgroundColor: C.accent, opacity: 0.38 }}
              />
              <motion.p
                className="leading-relaxed text-sm"
                style={{ ...bodyFont, color: C.muted }}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 1.2 }}
              >
                Ao longo dos últimos anos, acompanhei empresas que cresceram,
                escalaram e também muitas que travaram nas vendas por erros
                simples de comunicação. E um deles aparece o tempo todo:{" "}
                <strong style={{ color: C.text }}>
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
              className="absolute top-[6px] left-[6px] w-[calc(100%-6px)] h-[calc(100%-6px)]"
              style={{ backgroundColor: C.accent, opacity: 0.85 }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 0.85, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
            />

            <div
              className="relative overflow-hidden"
              style={{
                aspectRatio: "2/3",
                boxShadow: `
                  0 2px 8px rgba(25,57,108,0.25),
                  0 4px 20px rgba(25,57,108,0.15),
                  0 8px 50px rgba(25,57,108,0.08),
                  0 0 40px rgba(223,130,60,0.12)
                `,
              }}
            >
              <img
                src={bio.portraitImageUrl}
                alt="Gislaine Lozano"
                className="w-full h-full object-cover object-top"
              />

              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(180deg,
                    transparent 0%,
                    transparent 35%,
                    rgba(25,57,108,0.15) 50%,
                    rgba(25,57,108,0.50) 65%,
                    rgba(25,57,108,0.80) 80%,
                    rgba(25,57,108,0.92) 92%,
                    #19396C 100%
                  )`,
                }}
              />

              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(270deg,
                    rgba(250,246,239,0.50) 0%,
                    rgba(250,246,239,0.20) 8%,
                    transparent 22%
                  )`,
                }}
              />

              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(ellipse 120% 50% at 50% 0%, rgba(250,246,239,0.12) 0%, transparent 60%)`,
                }}
              />

              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(90deg,
                    rgba(223,130,60,0.08) 0%,
                    transparent 12%
                  )`,
                }}
              />

              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(ellipse 80% 60% at 20% 100%, rgba(223,130,60,0.15) 0%, transparent 70%)`,
                }}
              />

              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  background: `linear-gradient(135deg,
                    transparent 30%,
                    rgba(223,130,60,0.5) 50%,
                    transparent 70%
                  )`,
                  backgroundSize: "200% 200%",
                  animation: "shimmer 8s linear infinite",
                }}
              />

              <div
                className="absolute top-[10%] right-0 w-[2px] h-[80%]"
                style={{
                  background: `linear-gradient(180deg, transparent 0%, ${C.accent} 30%, ${C.accent} 70%, transparent 100%)`,
                  opacity: 0.38,
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
