const POSTHOG_HOST = process.env.POSTHOG_HOST || process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com';
const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY || process.env.NEXT_PUBLIC_POSTHOG_API_KEY;
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID || process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID;

interface QueryResult {
  columns: string[];
  results: any[][];
  types: string[];
}

interface PostHogInsight {
  result: {
    data: number[];
    days: string[];
    labels: string[];
    count: number;
  }[];
}

async function fetchFromPostHog<T>(path: string, options?: RequestInit): Promise<T> {
  if (!POSTHOG_API_KEY) {
    throw new Error('POSTHOG_API_KEY not configured');
  }

  const url = `${POSTHOG_HOST}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${POSTHOG_API_KEY}`,
      ...(options?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PostHog API error (${res.status}): ${text}`);
  }

  return res.json();
}

function getProjectId(): string {
  if (!POSTHOG_PROJECT_ID) throw new Error('POSTHOG_PROJECT_ID not configured');
  return POSTHOG_PROJECT_ID;
}

async function runHogQL(query: string): Promise<QueryResult> {
  const projectId = getProjectId();
  return fetchFromPostHog<QueryResult>(`/api/projects/${projectId}/query/`, {
    method: 'POST',
    body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
  });
}

export interface PostHogAnalytics {
  pageViews: { total: number; trend: { date: string; count: number }[] };
  uniqueVisitors: number;
  topSources: { source: string; count: number }[];
  topPages: { path: string; views: number }[];
  recentEvents: { event: string; count: number }[];
  conversionFunnel: { step: string; count: number }[];
}

interface CachedAnalytics {
  expiresAt: number;
  data: PostHogAnalytics;
}

/** In-memory cache for analytics. TTL keeps PostHog external calls bounded. */
const CACHE_TTL_MS = 60_000;
const analyticsCache = new Map<string, CachedAnalytics>();

export function clearPostHogCache() {
  analyticsCache.clear();
}

export function getPostHogCacheStats() {
  const now = Date.now();
  let valid = 0;
  for (const v of analyticsCache.values()) {
    if (v.expiresAt > now) valid++;
  }
  return { entries: analyticsCache.size, valid };
}

function emptyPostHogAnalytics(): PostHogAnalytics {
  return {
    pageViews: { total: 0, trend: [] },
    uniqueVisitors: 0,
    topSources: [],
    topPages: [],
    recentEvents: [],
    conversionFunnel: [],
  };
}

export async function getPostHogAnalytics(days = 30): Promise<PostHogAnalytics> {
  const cacheKey = `ph:${days}`;
  const cached = analyticsCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  if (!isPostHogConfigured()) {
    return emptyPostHogAnalytics();
  }

  try {
    const [
      pageViewsTrendRes,
      uniqueVisitorsRes,
      topPagesRes,
      sourcesRes,
      eventsRes,
      funnelRes,
    ] = await Promise.all([
      runHogQL(`
        SELECT toStartOfDay(timestamp) as day, count() as count
        FROM events
        WHERE timestamp >= now() - INTERVAL ${days} DAY AND event = '$pageview'
        GROUP BY day
        ORDER BY day ASC
      `),
      runHogQL(`
        SELECT count(DISTINCT distinct_id) as count
        FROM events
        WHERE timestamp >= now() - INTERVAL ${days} DAY AND event = '$pageview'
      `),
      runHogQL(`
        SELECT properties.\$current_url as path, count() as views
        FROM events
        WHERE timestamp >= now() - INTERVAL ${days} DAY AND event = '$pageview'
        GROUP BY path
        ORDER BY views DESC
        LIMIT 10
      `),
      runHogQL(`
        SELECT properties.utm_source as source, count() as count
        FROM events
        WHERE timestamp >= now() - INTERVAL ${days} DAY AND event = '$pageview'
        GROUP BY source
        ORDER BY count DESC
        LIMIT 10
      `),
      runHogQL(`
        SELECT event, count() as count
        FROM events
        WHERE timestamp >= now() - INTERVAL 7 DAY
          AND event NOT LIKE '$%'
        GROUP BY event
        ORDER BY count DESC
        LIMIT 15
      `),
      runHogQL(`
        SELECT event, count() as count
        FROM events
        WHERE timestamp >= now() - INTERVAL ${days} DAY
          AND event IN ('\$pageview', 'whatsapp_click', 'contact_form_started', 'contact_form_submitted', 'lead_created')
        GROUP BY event
        ORDER BY count DESC
      `),
    ]);

    const totalPageViews = pageViewsTrendRes.results.reduce((a, b) => a + Number(b[1]), 0);
    const trendDays = pageViewsTrendRes.results.map((r) => r[0]);
    const data = pageViewsTrendRes.results.map((r) => Number(r[1]));
    const uniqueVisitorsTotal = Number(uniqueVisitorsRes.results[0]?.[0] || 0);

    const topPages = topPagesRes.results.map((r) => ({
      path: String(r[0]),
      views: Number(r[1]),
    }));

    const topSources = sourcesRes.results.map((r) => ({
      source: String(r[0] || 'direct'),
      count: Number(r[1]),
    }));

    const recentEvents = (eventsRes.results || []).map((row: any) => ({
      event: String(row[0]),
      count: Number(row[1]),
    }));

    const funnelSteps = ['$pageview', 'whatsapp_click', 'contact_form_started', 'contact_form_submitted', 'lead_created'];
    const funnelMap = new Map<string, number>();
    (funnelRes.results || []).forEach((row: any) => {
      funnelMap.set(String(row[0]), Number(row[1]));
    });

    const conversionFunnel = funnelSteps.map((step) => ({
      step: step.replace('$', '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      count: funnelMap.get(step) || 0,
    }));

    const result: PostHogAnalytics = {
      pageViews: {
        total: totalPageViews,
        trend: trendDays.map((day, i) => ({ date: day, count: data[i] || 0 })),
      },
      uniqueVisitors: uniqueVisitorsTotal,
      topSources,
      topPages: topPages.slice(0, 10),
      recentEvents,
      conversionFunnel,
    };

    analyticsCache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, data: result });
    return result;
  } catch (error) {
    console.error('PostHog analytics fetch error:', error);
    return emptyPostHogAnalytics();
  }
}

export function isPostHogConfigured(): boolean {
  return !!(process.env.POSTHOG_API_KEY || process.env.NEXT_PUBLIC_POSTHOG_API_KEY);
}
