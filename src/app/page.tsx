import dynamic from 'next/dynamic';
import { Navbar } from '@/components/gislaine/navbar';
import { HeroSection } from '@/components/gislaine/hero';
import { Footer } from '@/components/gislaine/footer';
import { WhatsAppFab } from '@/components/gislaine/whatsapp-fab';
import { LoaderInline } from '@/components/gislaine/loader';

const ForWhoSection = dynamic(() =>
  import('@/components/gislaine/pain-points').then((m) => ({ default: m.PainSection }))
, { loading: () => <LoaderInline /> });

const BioSection = dynamic(() =>
  import('@/components/gislaine/bio').then((m) => ({ default: m.BioSection }))
, { loading: () => <LoaderInline /> });

const PosicionamentoSection = dynamic(() =>
  import('@/components/gislaine/posicionamento').then((m) => ({ default: m.PosicionamentoSection }))
, { loading: () => <LoaderInline /> });

const ServicesSection = dynamic(() =>
  import('@/components/gislaine/services').then((m) => ({ default: m.ServicesSection }))
, { loading: () => <LoaderInline /> });

const ResultsSection = dynamic(() =>
  import('@/components/gislaine/results').then((m) => ({ default: m.ResultsSection }))
, { loading: () => <LoaderInline /> });

const FaqSection = dynamic(() =>
  import('@/components/gislaine/faq').then((m) => ({ default: m.FaqSection }))
, { loading: () => <LoaderInline /> });

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ForWhoSection />
        <BioSection />
        <PosicionamentoSection />
        <ServicesSection />
        <ResultsSection />
        <FaqSection />
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
