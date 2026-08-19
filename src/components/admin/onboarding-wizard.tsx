'use client';

import { useState, useEffect } from 'react';
import { C } from '@/components/gislaine/constants';
import { StepIndicator } from './step-indicator';

interface Config {
  ga4Id: string;
  fbPixelId: string;
  gAdsId: string;
  gAdsLabel: string;
}

export function OnboardingWizard({ initialConfig, onComplete }: { initialConfig: Config; onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Config>(initialConfig);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const saveStep = async (next = true) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Falha ao salvar');
      if (next) setStep((s) => s + 1);
    } catch {
      setError('Erro ao salvar progresso');
    } finally {
      setLoading(false);
    }
  };

  const testIntegration = async (service: 'ga4' | 'facebook' | 'google-ads', id: string) => {
    if (!id.trim()) return true; // allow skipping empty optional integrations
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service, id }),
      });
      const result = await res.json();
      if (!result.ok) setError(result.message);
      else setError('');
      return result.ok;
    } catch {
      setError('Erro ao testar integração');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8" style={{ backgroundColor: C.white }}>
      <StepIndicator currentStep={step} totalSteps={5} completedSteps={Array.from({length: step - 1}, (_, i) => i + 1)} />

      {error && (
        <div className="mb-4 p-3 text-sm" role="alert" aria-live="polite" style={{ backgroundColor: C.warning, color: C.warningText }}>
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-outfit)', color: C.primary }}>Bem-vindo</h2>
          <p className="text-sm" style={{ color: C.muted }}>Configure suas integrações de tracking para acompanhar resultados das suas campanhas.</p>
          <button
            type="button"
            disabled={loading}
            onClick={() => setStep(2)}
            className="w-full py-2.5 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-opacity focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2"
            style={{ backgroundColor: C.accent, color: C.white, borderRadius: 0 }}
          >
            Começar
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-outfit)', color: C.primary }}>Google Analytics</h2>
          <label htmlFor="ga4" className="block text-sm font-medium" style={{ color: C.text }}>Measurement ID</label>
          <input
            id="ga4"
            className="w-full p-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-g-accent transition-all"
            placeholder="G-XXXXXXXXXX"
            value={data.ga4Id}
            onChange={(e) => setData({ ...data, ga4Id: e.target.value })}
            autoComplete="off"
            style={{ border: `1px solid ${C.inactive}`, borderRadius: 0 }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => setStep(1)}
              className="flex-1 py-2 text-sm border disabled:opacity-60 disabled:cursor-not-allowed transition-opacity focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2"
              style={{ borderColor: C.inactive, borderRadius: 0 }}
            >
              Voltar
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={async () => { if (await testIntegration('ga4', data.ga4Id)) saveStep(); }}
              className="flex-1 py-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed transition-opacity focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2"
              style={{ backgroundColor: C.accent, color: C.white, borderRadius: 0 }}
            >
              {loading ? '...' : 'Avançar'}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-outfit)', color: C.primary }}>Facebook Pixel</h2>
          <label htmlFor="fb" className="block text-sm font-medium" style={{ color: C.text }}>Pixel ID</label>
          <input
            id="fb"
            className="w-full p-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-g-accent transition-all"
            placeholder="123456789012345"
            value={data.fbPixelId}
            onChange={(e) => setData({ ...data, fbPixelId: e.target.value })}
            autoComplete="off"
            style={{ border: `1px solid ${C.inactive}`, borderRadius: 0 }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => setStep(2)}
              className="flex-1 py-2 text-sm border disabled:opacity-60 disabled:cursor-not-allowed transition-opacity focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2"
              style={{ borderColor: C.inactive, borderRadius: 0 }}
            >
              Voltar
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={async () => { if (await testIntegration('facebook', data.fbPixelId)) saveStep(); }}
              className="flex-1 py-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed transition-opacity focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2"
              style={{ backgroundColor: C.accent, color: C.white, borderRadius: 0 }}
            >
              {loading ? '...' : 'Avançar'}
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-outfit)', color: C.primary }}>Google Ads</h2>
          <label htmlFor="gads-id" className="block text-sm font-medium" style={{ color: C.text }}>Conversion ID</label>
          <input
            id="gads-id"
            className="w-full p-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-g-accent transition-all"
            placeholder="AW-XXXXXXXXX"
            value={data.gAdsId}
            onChange={(e) => setData({ ...data, gAdsId: e.target.value })}
            autoComplete="off"
            style={{ border: `1px solid ${C.inactive}`, borderRadius: 0 }}
          />
          <label htmlFor="gads-label" className="block text-sm font-medium" style={{ color: C.text }}>Conversion Label (opcional)</label>
          <input
            id="gads-label"
            className="w-full p-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-g-accent transition-all"
            placeholder="Label"
            value={data.gAdsLabel}
            onChange={(e) => setData({ ...data, gAdsLabel: e.target.value })}
            autoComplete="off"
            style={{ border: `1px solid ${C.inactive}`, borderRadius: 0 }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => setStep(3)}
              className="flex-1 py-2 text-sm border disabled:opacity-60 disabled:cursor-not-allowed transition-opacity focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2"
              style={{ borderColor: C.inactive, borderRadius: 0 }}
            >
              Voltar
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={async () => { if (await testIntegration('google-ads', data.gAdsId)) saveStep(); }}
              className="flex-1 py-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed transition-opacity focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2"
              style={{ backgroundColor: C.accent, color: C.white, borderRadius: 0 }}
            >
              {loading ? '...' : 'Avançar'}
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-outfit)', color: C.primary }}>Revisar</h2>
          <div className="space-y-2 text-sm">
            <p>GA4: {data.ga4Id || 'Não configurado'}</p>
            <p>Facebook: {data.fbPixelId || 'Não configurado'}</p>
            <p>Google Ads: {data.gAdsId || 'Não configurado'}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => setStep(4)}
              className="flex-1 py-2 text-sm border disabled:opacity-60 disabled:cursor-not-allowed transition-opacity focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2"
              style={{ borderColor: C.inactive, borderRadius: 0 }}
            >
              Voltar
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={async () => { await saveStep(false); onComplete(); }}
              className="flex-1 py-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed transition-opacity focus-visible:ring-2 focus-visible:ring-g-accent focus-visible:ring-offset-2"
              style={{ backgroundColor: C.accent, color: C.white, borderRadius: 0 }}
            >
              {loading ? 'Salvando...' : 'Concluir'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
