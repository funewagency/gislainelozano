'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useCmsData } from '@/hooks/use-cms-data';
import { motion, useInView } from 'framer-motion';
import { C, headingFont, bodyFont } from './constants';
import { trackSectionView } from '@/lib/analytics';

interface CardItem {
  badge: string;
  title: string;
  description: string;
}

const defaultBadges = [
  'Comunicação & Vendas',
  'Atendimento & Conversão',
  'Posicionamento & Marca',
  'Visão Estratégica',
  'Crescimento Digital',
  'Liderança Comercial',
];

function parseCardItem(raw: string, index: number): CardItem {
  // 1. Suporte a sintaxe explícita com pipe: "Badge | Título | Descrição" ou "Título | Descrição"
  if (raw.includes('|')) {
    const parts = raw.split('|').map((p) => p.trim());
    if (parts.length >= 3) {
      return {
        badge: parts[0],
        title: parts[1],
        description: parts.slice(2).join(' | '),
      };
    }
    if (parts.length === 2) {
      return {
        badge: defaultBadges[index] || `Perfil ${String(index + 1).padStart(2, '0')}`,
        title: parts[0],
        description: parts[1],
      };
    }
  }

  // 2. Mapeamento enriquecido para os textos padrão do projeto
  const lower = raw.toLowerCase();
  if (lower.includes('potencial') && lower.includes('comunica')) {
    return {
      badge: 'Comunicação & Vendas',
      title: 'Tem potencial, mas a comunicação não sustenta as vendas',
      description:
        'Você sabe que o seu negócio tem capacidade de crescer, mas a mensagem e a comunicação ainda não atraem os clientes certos nem convertem na proporção esperada.',
    };
  }
  if (lower.includes('atende clientes') || lower.includes('atendimento')) {
    return {
      badge: 'Atendimento & Conversão',
      title: 'Perde oportunidades por falhas no fluxo de atendimento',
      description:
        'Você atende contatos todos os dias, mas percebe que vendas importantes são perdidas pela falta de processos comerciais e direcionamento ágil.',
    };
  }
  if (lower.includes('estruturar marketing') || lower.includes('posicionamento')) {
    return {
      badge: 'Posicionamento & Marca',
      title: 'Quer estruturar marketing e vendas de forma profissional',
      description:
        'Você quer sair da tentativa e erro para construir um posicionamento sólido, autoridade e canais de atração organizados com consistência.',
    };
  }
  if (lower.includes('visão estratégica') || lower.includes('consistência')) {
    return {
      badge: 'Visão Estratégica',
      title: 'Deseja visão estratégica para crescer com consistência',
      description:
        'Busca clareza de rota, método e acompanhamento especializado para tomar decisões assertivas e expandir seu faturamento com foco e intenção.',
    };
  }

  // 3. Fallback inteligente para itens customizados adicionados no CMS
  let cleaned = raw.replace(/^para quem\s+/i, '').trim();
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

  const commaIdx = cleaned.indexOf(',');
  if (commaIdx > 12 && commaIdx < cleaned.length - 12) {
    return {
      badge: defaultBadges[index] || `Perfil ${String(index + 1).padStart(2, '0')}`,
      title: cleaned.slice(0, commaIdx).trim(),
      description: cleaned.slice(commaIdx + 1).trim(),
    };
  }

  return {
    badge: defaultBadges[index] || `Perfil ${String(index + 1).padStart(2, '0')}`,
    title: cleaned,
    description: raw,
  };
}

function getCardSpanClass(total: number, index: number): string {
  if (total === 5) {
    // 3 cards no topo (2/6 colunas cada) e 2 cards embaixo (3/6 colunas cada)
    return index < 3
      ? 'col-span-1 md:col-span-3 lg:col-span-2'
      : 'col-span-1 md:col-span-3 lg:col-span-3';
  }
  if (total === 4) {
    // Grade 2x2 equilibrada (3/6 colunas cada)
    return 'col-span-1 md:col-span-3 lg:col-span-3';
  }
  if (total % 3 === 0) {
    return 'col-span-1 md:col-span-3 lg:col-span-2';
  }
  return 'col-span-1 md:col-span-3 lg:col-span-3';
}

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

  const cards = useMemo(() => {
    return painPoints.bullets.map((bullet, idx) => parseCardItem(bullet, idx));
  }, [painPoints.bullets]);

  return (
    <section
      ref={ref}
      id="para-quem"
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ backgroundColor: C.base }}
    >
      <div
        className="absolute top-0 right-0 w-[360px] h-[360px] opacity-[0.06]"
        style={{
          background: 'radial-gradient(circle, rgba(223,130,60,1) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[300px] h-[300px] opacity-[0.05]"
        style={{
          background: 'radial-gradient(circle, rgba(25,57,108,0.6) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          className="text-center mb-14 lg:mb-16"
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
            className="text-2xl sm:text-3xl lg:text-4xl leading-tight font-bold text-balance"
            style={{ ...headingFont, color: C.primary }}
            initial={{ opacity: 0, y: 28 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Para quem é essa mentoria?
          </motion.h2>
        </motion.div>

        {cards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 lg:gap-8 mb-16 sm:mb-20">
            {cards.map((card, index) => (
              <motion.div
                key={index}
                className={`group relative rounded-2xl overflow-hidden cursor-default transition-all duration-500 flex flex-col justify-between ${getCardSpanClass(cards.length, index)}`}
                style={{
                  backgroundColor: C.white,
                  boxShadow:
                    '0 1px 3px rgba(26,28,32,0.04), 0 4px 12px rgba(26,28,32,0.03)',
                }}
                initial={{ opacity: 0, y: 35 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.15 + index * 0.1, ease: 'easeOut' }}
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

                <div className="p-6 sm:p-8 lg:p-9 flex-1 flex flex-col justify-start">
                  <div className="mb-5">
                    <span
                      className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs sm:text-[13px] font-semibold tracking-wide shadow-sm"
                      style={{ backgroundColor: C.primary, color: C.white }}
                    >
                      {card.badge}
                    </span>
                  </div>

                  <h3
                    className="text-xl sm:text-2xl font-bold tracking-tight text-balance leading-snug mb-3.5"
                    style={{ ...headingFont, color: C.primary }}
                  >
                    {card.title}
                  </h3>

                  <p
                    className="text-sm sm:text-base leading-relaxed"
                    style={{ ...bodyFont, color: C.muted }}
                  >
                    {card.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
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
          className="relative py-8 md:py-12 px-6 md:px-8 lg:px-16 text-center lg:text-left overflow-hidden rounded-3xl"
          style={{ backgroundColor: C.primary }}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
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
              className="text-2xl md:text-3xl lg:text-4xl leading-snug font-bold"
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

