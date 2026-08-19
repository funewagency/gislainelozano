'use client';

import { useEffect } from 'react';
import { setPreviewData } from '@/lib/cms-preview-state';
import type { GlobalConfig } from '@/lib/cms-types';
import dynamic from 'next/dynamic';

const HeroSection = dynamic(() => import('@/components/gislaine/hero').then(m => ({ default: m.HeroSection })), { ssr: false });
const PainSection = dynamic(() => import('@/components/gislaine/pain-points').then(m => ({ default: m.PainSection })), { ssr: false });
const BioSection = dynamic(() => import('@/components/gislaine/bio').then(m => ({ default: m.BioSection })), { ssr: false });
const PosicionamentoSection = dynamic(() => import('@/components/gislaine/posicionamento').then(m => ({ default: m.PosicionamentoSection })), { ssr: false });
const ServicesSection = dynamic(() => import('@/components/gislaine/services').then(m => ({ default: m.ServicesSection })), { ssr: false });
const ResultsSection = dynamic(() => import('@/components/gislaine/results').then(m => ({ default: m.ResultsSection })), { ssr: false });
const FaqSection = dynamic(() => import('@/components/gislaine/faq').then(m => ({ default: m.FaqSection })), { ssr: false });
const ContactSection = dynamic(() => import('@/components/gislaine/contact').then(m => ({ default: m.ContactSection })), { ssr: false });

export default function AdminPreviewPage() {
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === 'cms-preview-update' && e.data?.data) {
        setPreviewData(e.data.data as GlobalConfig);
      }
    }
    window.addEventListener('message', handleMessage);

    // Notify parent we're ready
    if (window.opener || parent !== window) {
      const target = window.opener || parent;
      target.postMessage({ type: 'cms-preview-ready' }, '*');
    }

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="min-h-screen">
      <HeroSection />
      <PainSection />
      <BioSection />
      <PosicionamentoSection />
      <ServicesSection />
      <ResultsSection />
      <FaqSection />
      <ContactSection />
    </div>
  );
}
