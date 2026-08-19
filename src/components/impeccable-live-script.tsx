'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';

export function ImpeccableLiveScript() {
  // Desativado localmente se o servidor do live edit não estiver rodando
  return null;
}
