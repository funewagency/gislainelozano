'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import nextDynamic from 'next/dynamic';
import { C } from '@/components/gislaine/constants';
import { RetryBanner } from '@/components/admin/admin-skeleton';

const OnboardingWizard = nextDynamic(
  () => import('@/components/admin/onboarding-wizard').then((m) => m.OnboardingWizard),
  { ssr: false }
);

const IntegrationCard = nextDynamic(
  () => import('@/components/admin/integration-card').then((m) => m.IntegrationCard),
  { ssr: false }
);

type ServiceKey = 'ga4' | 'fb' | 'gAds';

interface ConfigState {
  ga4Id: string;
  fbPixelId: string;
  gAdsId: string;
  gAdsLabel: string;
  configured: Record<ServiceKey, boolean>;
}

export default function SettingsPage() {
  const [config, setConfig] = useState<ConfigState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const loadConfig = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/settings');

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Erro ${res.status}`);
      }

      const d = await res.json();
      setConfig(d);
    } catch (err) {
      const message = (err as Error).message || 'Erro ao carregar configurações';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-bold mb-6" style={{ fontFamily: 'var(--font-outfit)', color: C.primary }}>Configurações</h1>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 border animate-pulse" style={{ backgroundColor: C.white, borderColor: C.border }}>
              <div className="h-5 w-40" style={{ backgroundColor: C.border }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-xl font-bold mb-6" style={{ fontFamily: 'var(--font-outfit)', color: C.primary }}>Configurações</h1>
        <RetryBanner onRetry={loadConfig} message={error} />
      </div>
    );
  }

  if (!config) return null;

  const anyConfigured = config.configured.ga4 || config.configured.fb || config.configured.gAds;

  if (!anyConfigured || editing) {
    return (
      <div>
        <h1 className="text-xl font-bold mb-6" style={{ fontFamily: 'var(--font-outfit)', color: C.primary }}>Configurações</h1>
        <OnboardingWizard
          initialConfig={config}
          onComplete={() => {
            setEditing(false);
            loadConfig();
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6" style={{ fontFamily: 'var(--font-outfit)', color: C.primary }}>Configurações</h1>
      <div className="grid gap-4">
        <IntegrationCard title="Google Analytics" configured={config.configured.ga4} onEdit={() => setEditing(true)} />
        <IntegrationCard title="Facebook Pixel" configured={config.configured.fb} onEdit={() => setEditing(true)} />
        <IntegrationCard title="Google Ads" configured={config.configured.gAds} onEdit={() => setEditing(true)} />
      </div>
    </div>
  );
}
