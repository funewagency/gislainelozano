'use client';

import { C } from '@/components/gislaine/constants';
import { Settings } from 'lucide-react';

export function IntegrationCard({ title, configured, onEdit }: { title: string; configured: boolean; onEdit: () => void }) {
  return (
    <div className="p-4 border flex items-center justify-between" style={{ backgroundColor: C.white, borderColor: C.border }}>
      <div className="flex items-center gap-3">
        <Settings size={20} style={{ color: configured ? C.accent : C.inactive }} aria-hidden="true" />
        <span className="font-semibold text-sm" style={{ color: C.primary }}>{title}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs font-medium px-2 py-1" style={{ backgroundColor: configured ? '#DCFCE7' : '#F3F4F6', color: configured ? '#166534' : C.muted }}>
          {configured ? 'Configurado' : 'Não configurado'}
        </span>
        <button
          onClick={onEdit}
          className="text-xs font-medium underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2 rounded-sm"
          style={{ color: C.accentDark }}
          type="button"
        >
          Editar
        </button>
      </div>
    </div>
  );
}
