'use client';

import { C } from '@/components/gislaine/constants';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';

interface SourceStat {
  source: string;
  count: number;
}

interface PageViewTrend {
  date: string;
  count: number;
}

interface TopPage {
  path: string;
  views: number;
}

interface RecentEvent {
  event: string;
  count: number;
}

interface FunnelStep {
  step: string;
  count: number;
}

interface PostHogData {
  configured: boolean;
  pageViews: { total: number; trend: PageViewTrend[] };
  uniqueVisitors: number;
  topSources: SourceStat[];
  topPages: TopPage[];
  recentEvents: RecentEvent[];
  conversionFunnel: FunnelStep[];
}

interface AnalyticsPanelProps {
  leadsTotal: number;
  leadsBySource: SourceStat[];
  posthog: PostHogData | null;
  loading?: boolean;
}

const COLORS = [C.primary, C.accent, C.primaryLight, C.accentLight, C.muted, C.cta, C.text, '#22C55E', '#3B82F6', '#8B5CF6'];

const sourceLabels: Record<string, string> = {
  google: 'Google',
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  twitter: 'Twitter',
  direct: 'Acesso Direto',
  'whatsapp-fab': 'WhatsApp Fab',
  'contact-section': 'Seção Contato',
};

export function AnalyticsPanel({ leadsTotal, leadsBySource, posthog, loading }: AnalyticsPanelProps) {
  const phConfigured = posthog?.configured;
  const phPageViews = posthog?.pageViews?.total ?? 0;
  const phUniqueVisitors = posthog?.uniqueVisitors ?? 0;
  const conversionRate = phUniqueVisitors > 0
    ? ((leadsTotal / phUniqueVisitors) * 100).toFixed(2)
    : '0.00';

  const leadsChartData = leadsBySource.map((s) => ({
    name: sourceLabels[s.source] || s.source || 'Desconhecida',
    leads: s.count,
  }));

  const phSourcesChartData = (posthog?.topSources ?? []).map((s) => ({
    name: sourceLabels[s.source] || s.source || 'Desconhecida',
    visitas: s.count,
  }));

  const conversionFunnel = posthog?.conversionFunnel ?? [];
  const pageViewTrend = posthog?.pageViews?.trend ?? [];
  const topPages = posthog?.topPages ?? [];
  const recentEvents = posthog?.recentEvents ?? [];

  return (
    <div className="space-y-8">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          label="Leads"
          value={leadsTotal.toLocaleString('pt-BR')}
          subtitle="formulários"
          loading={loading}
        />
        <KpiCard
          label="Visualizações"
          value={phPageViews.toLocaleString('pt-BR')}
          subtitle={phConfigured ? 'PostHog' : 'não configurado'}
          loading={loading || !posthog}
        />
        <KpiCard
          label="Visitantes Únicos"
          value={phUniqueVisitors.toLocaleString('pt-BR')}
          subtitle={phConfigured ? '30 dias' : 'não configurado'}
          loading={loading || !posthog}
        />
        <KpiCard
          label="Conversão"
          value={`${conversionRate}%`}
          subtitle="leads / visitantes"
          loading={loading || !posthog}
        />
      </div>

      {/* Row 2: Page Views Trend + Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Page Views Trend */}
        <div className="p-4" style={{ backgroundColor: C.white }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: C.primary }}>
            Visualizações (30 dias)
          </h3>
          {!phConfigured ? (
            <EmptyState message="Configure POSTHOG_API_KEY no .env" />
          ) : pageViewTrend.length === 0 ? (
            <EmptyState message="Sem dados de visualização" loading={loading} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={pageViewTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: C.muted }}
                  axisLine={{ stroke: C.border }}
                  tickLine={false}
                  tickFormatter={(v) => {
                    const d = new Date(v);
                    if (Number.isNaN(d.getTime())) return v;
                    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: C.muted }}
                  axisLine={{ stroke: C.border }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: C.white, border: 'none', borderRadius: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 13 }}
                  labelFormatter={(v) => {
                    const d = new Date(v);
                    return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString('pt-BR');
                  }}
                />
                <Line type="monotone" dataKey="count" stroke={C.primary} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Conversion Funnel */}
        <div className="p-4" style={{ backgroundColor: C.white }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: C.primary }}>
            Funil de Conversão
          </h3>
          {!phConfigured ? (
            <EmptyState message="Configure POSTHOG_API_KEY no .env" />
          ) : conversionFunnel.length === 0 ? (
            <EmptyState message="Nenhum evento registrado" loading={loading} />
          ) : (
            <div className="space-y-3">
              {conversionFunnel.map((step, i, arr) => {
                const maxCount = Math.max(...arr.map((s) => s.count), 1);
                const pct = (step.count / maxCount) * 100;
                let barColor: string = C.accent;
                if (i === 0) barColor = C.primary;
                else if (i === arr.length - 1) barColor = '#22C55E';
                return (
                  <div key={step.step}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span style={{ color: C.text }}>{step.step}</span>
                      <span style={{ color: C.muted }}>{step.count.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="h-2 w-full" style={{ backgroundColor: C.border }}>
                      <div
                        className="h-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: barColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Sources Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Sources (SQLite) */}
        <div className="p-4" style={{ backgroundColor: C.white }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: C.primary }}>
            Leads por Origem (SQLite)
          </h3>
          {leadsChartData.length === 0 ? (
            <EmptyState message="Nenhum lead registrado" loading={loading} />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={leadsChartData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.muted }} axisLine={{ stroke: C.border }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={{ stroke: C.border }} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: C.white, border: 'none', borderRadius: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 13 }} />
                <Bar dataKey="leads" fill={C.primary} radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Traffic Sources (PostHog) */}
        <div className="p-4" style={{ backgroundColor: C.white }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: C.primary }}>
            Tráfego por Origem (PostHog)
          </h3>
          {!phConfigured ? (
            <EmptyState message="Configure POSTHOG_API_KEY no .env" />
          ) : phSourcesChartData.length === 0 ? (
            <EmptyState message="Sem dados de tráfego" loading={loading} />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={phSourcesChartData} dataKey="visitas" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={40}>
                  {phSourcesChartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: C.white, border: 'none', borderRadius: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 13 }} />
                <Legend wrapperStyle={{ fontSize: 11, color: C.muted }} iconType="square" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Row 4: Top Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4" style={{ backgroundColor: C.white }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: C.primary }}>
            Páginas Mais Visitadas
          </h3>
          {!phConfigured ? (
            <EmptyState message="Configure POSTHOG_API_KEY no .env" />
          ) : topPages.length === 0 ? (
            <EmptyState message="Sem dados" loading={loading} />
          ) : (
            <div className="space-y-2">
              {topPages.slice(0, 8).map((page, i) => {
                const maxViews = Math.max(...topPages.map((p) => p.views), 1);
                return (
                  <div key={page.path} className="flex items-center gap-3 text-sm">
                    <span className="text-xs font-medium w-5 text-right" style={{ color: C.muted }}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="truncate" style={{ color: C.text }}>{page.path}</div>
                      <div className="h-1.5 mt-1 w-full" style={{ backgroundColor: C.border }}>
                        <div className="h-full" style={{ width: `${(page.views / maxViews) * 100}%`, backgroundColor: C.accent }} />
                      </div>
                    </div>
                    <span className="font-medium text-xs" style={{ color: C.muted }}>{page.views}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Events */}
        <div className="p-4" style={{ backgroundColor: C.white }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: C.primary }}>
            Eventos Recentes (7 dias)
          </h3>
          {!phConfigured ? (
            <EmptyState message="Configure POSTHOG_API_KEY no .env" />
          ) : recentEvents.length === 0 ? (
            <EmptyState message="Sem eventos personalizados" loading={loading} />
          ) : (
            <div className="space-y-1">
              {recentEvents.slice(0, 10).map((evt) => (
                <div key={evt.event} className="flex items-center justify-between py-1.5 text-sm" style={{ borderBottom: `1px solid ${C.surfaceAlt}` }}>
                  <span style={{ color: C.text }}>{formatEventLabel(evt.event)}</span>
                  <span className="font-medium" style={{ color: C.primary }}>{evt.count.toLocaleString('pt-BR')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {!phConfigured && (
        <div className="p-4 text-sm" style={{ backgroundColor: C.warning, color: C.warningText }}>
          PostHog API não configurada. Adicione <code className="font-mono font-bold">POSTHOG_API_KEY</code> ao seu .env para visualizar dados reais de analytics. Acesse PostHog → Settings → Personal API Keys.
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, subtitle, loading }: { label: string; value: string; subtitle?: string; loading?: boolean }) {
  return (
    <div className="p-4" style={{ backgroundColor: C.white }}>
      <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: C.muted }}>
        {label}
      </p>
      {loading ? (
        <div className="h-8 w-20 animate-pulse" style={{ backgroundColor: C.border }} />
      ) : (
        <p className="text-2xl font-bold" style={{ color: C.primary }}>
          {value}
        </p>
      )}
      {subtitle && <p className="text-xs mt-0.5" style={{ color: C.muted }}>{subtitle}</p>}
    </div>
  );
}

function EmptyState({ message, loading }: { message: string; loading?: boolean }) {
  if (loading) {
    return <div className="flex items-center justify-center h-56 text-sm" style={{ color: C.muted }}>Carregando...</div>;
  }
  return <div className="flex items-center justify-center h-56 text-sm" style={{ color: C.muted }}>{message}</div>;
}

function formatEventLabel(event: string): string {
  return event.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
}
