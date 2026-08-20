'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import nextDynamic from 'next/dynamic';
import { C } from '@/components/gislaine/constants';
import { KpiSkeleton } from '@/components/admin/admin-skeleton';
import { RetryBanner } from '@/components/admin/admin-skeleton';

const AnalyticsPanel = nextDynamic(
  () => import('@/components/admin/analytics-panel').then((m) => m.AnalyticsPanel),
  { ssr: false }
);

interface SourceStat {
  source: string;
  count: number;
}

interface PageViewTrend {
  date: string;
  count: number;
}

interface PostHogData {
  configured: boolean;
  pageViews: { total: number; trend: PageViewTrend[] };
  uniqueVisitors: number;
  topSources: SourceStat[];
  topPages: { path: string; views: number }[];
  recentEvents: { event: string; count: number }[];
  conversionFunnel: { step: string; count: number }[];
}

export default function AdminDashboardPage() {
  const [leadsStats, setLeadsStats] = useState<{ total: number; bySource: SourceStat[] } | null>(null);
  const [posthog, setPosthog] = useState<PostHogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [leadsRes, phRes] = await Promise.all([
        fetch('/api/admin/leads?limit=1&stats=true'),
        fetch('/api/admin/analytics'),
      ]);

      if (!leadsRes.ok) throw new Error('Falha ao carregar leads');
      if (!phRes.ok) throw new Error('Falha ao carregar analytics');

      const [leadsData, phData] = await Promise.all([
        leadsRes.json(),
        phRes.json(),
      ]);

      setLeadsStats(leadsData.stats ?? { total: 0, bySource: [] });
      setPosthog(phData);
    } catch (err) {
      const message = (err as Error).message || 'Erro ao carregar dados do painel';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div>
      <h1 className="text-xl font-bold mb-6" style={{ fontFamily: 'var(--font-outfit)', color: C.primary }}>
        Painel
      </h1>

      {error && (
        <div className="mb-6">
          <RetryBanner onRetry={fetchData} message={error} />
        </div>
      )}

      {loading ? (
        <KpiSkeleton />
      ) : (
        <AnalyticsPanel
          leadsTotal={leadsStats?.total ?? 0}
          leadsBySource={leadsStats?.bySource ?? []}
          posthog={posthog}
          loading={false}
        />
      )}
    </div>
  );
}
