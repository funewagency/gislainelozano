'use client';

export const dynamic = 'force-dynamic';

import nextDynamic from 'next/dynamic';
import { C, headingFont } from '@/components/gislaine/constants';
import { Briefcase } from 'lucide-react';

const ServicesManager = nextDynamic(
  () => import('@/components/admin/services-manager').then((m) => m.ServicesManager),
  { ssr: false }
);

export default function ServicesSettingsPage() {
  return (
    <div>
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: `linear-gradient(135deg, ${C.accent} 0%, #EF9648 100%)`,
            boxShadow: `0 2px 8px ${C.accent}40`,
          }}
        >
          <Briefcase size={17} style={{ color: '#fff' }} />
        </div>
        <div>
          <h1
            className="text-xl font-bold leading-none"
            style={{ fontFamily: 'var(--font-outfit)', color: C.primary }}
          >
            Gerenciar Serviços
          </h1>
          <p className="text-xs mt-1" style={{ color: C.muted, fontFamily: 'var(--font-jakarta)' }}>
            Crie e edite os serviços exibidos no site · máximo de 5
          </p>
        </div>
      </div>

      {/* Manager */}
      <ServicesManager />
    </div>
  );
}
