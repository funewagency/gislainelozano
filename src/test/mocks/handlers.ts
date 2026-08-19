import { http, HttpResponse } from 'msw'
import { DEFAULT_CMS_DATA } from '@/lib/cms-defaults'

export const mockAnalyticsData = {
  configured: true,
  message: null,
  pageViews: {
    total: 1542,
    trend: [
      { date: '2026-06-01', count: 45 },
      { date: '2026-06-02', count: 52 },
      { date: '2026-06-03', count: 38 },
    ],
  },
  uniqueVisitors: 892,
  topSources: [
    { source: 'google', count: 320 },
    { source: 'direct', count: 210 },
  ],
  topPages: [
    { path: '/', views: 450 },
    { path: '/servicos', views: 230 },
  ],
  recentEvents: [
    { event: 'page_view', count: 1542 },
    { event: 'whatsapp_click', count: 89 },
  ],
  conversionFunnel: [
    { step: 'Visitantes', count: 892 },
    { step: 'Leads', count: 45 },
  ],
}

export const mockCmsData = {
  data: DEFAULT_CMS_DATA,
  meta: { version: 5, updatedAt: '2026-06-10T12:00:00Z', updatedBy: 'admin' },
  revisions: [
    { version: 4, summary: 'Atualização hero', timestamp: '2026-06-09T12:00:00Z', createdBy: 'admin', data: DEFAULT_CMS_DATA },
    { version: 3, summary: 'Novos serviços', timestamp: '2026-06-08T12:00:00Z', createdBy: 'admin', data: DEFAULT_CMS_DATA },
  ],
}

export const mockLeadsData = {
  leads: [
    { id: '1', name: 'João Silva', email: 'joao@test.com', phone: '5511999999999', message: 'Quero saber mais', source: 'google', medium: 'cpc', campaign: 'camp1', createdAt: '2026-06-10T10:00:00Z' },
    { id: '2', name: 'Maria Santos', email: 'maria@test.com', phone: '5511888888888', message: null, source: 'direct', medium: null, campaign: null, createdAt: '2026-06-09T08:30:00Z' },
    { id: '3', name: 'Carlos Pereira', email: 'carlos@test.com', phone: '5511777777777', message: 'Agendamento', source: 'instagram', medium: 'social', campaign: 'insta_camp', createdAt: '2026-06-08T15:45:00Z' },
  ],
  total: 3,
  page: 1,
  limit: 50,
  totalPages: 1,
  stats: {
    total: 3,
    last30Days: 3,
    bySource: [
      { source: 'google', count: 1 },
      { source: 'direct', count: 1 },
      { source: 'instagram', count: 1 },
    ],
  },
}

export const mockSettingsData = {
  ga4Id: 'G-XXXXXXXXXX',
  fbPixelId: '1234567890',
  gAdsId: 'AW-XXXXXXXXX',
  gAdsLabel: 'test_label',
  ga4Configured: true,
  fbConfigured: true,
  gAdsConfigured: true,
}

export const mockEmptySettingsData = {
  ga4Id: null,
  fbPixelId: null,
  gAdsId: null,
  gAdsLabel: null,
  ga4Configured: false,
  fbConfigured: false,
  gAdsConfigured: false,
}

export const mockImagesData = [
  { name: 'banner.jpg', url: '/uploads/banner.jpg', size: 102400, modifiedAt: '2026-06-10T12:00:00Z' },
  { name: 'profile.png', url: '/uploads/profile.png', size: 51200, modifiedAt: '2026-06-09T10:00:00Z' },
]

export const handlers = [
  // Admin Analytics
  http.get('/api/admin/analytics', () => {
    return HttpResponse.json(mockAnalyticsData)
  }),

  // Admin CMS
  http.get('/api/admin/cms', () => {
    return HttpResponse.json(mockCmsData)
  }),

  http.put('/api/admin/cms', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({
      success: true,
      revision: {
        version: (body?.meta as Record<string, unknown>)?.version ?? 6,
        summary: 'Salvo via editor',
        timestamp: new Date().toISOString(),
        createdBy: 'admin',
      },
    })
  }),

  // Admin CMS Revisions
  http.get('/api/admin/cms/revisions', ({ request }) => {
    const url = new URL(request.url)
    const version = url.searchParams.get('version')
    if (version === '999') {
      return HttpResponse.json({ error: 'Revisão não encontrada' }, { status: 404 })
    }
    if (version) {
      return HttpResponse.json({
        revisions: [mockCmsData.revisions.find(r => r.version === Number(version))].filter(Boolean),
      })
    }
    return HttpResponse.json({ revisions: mockCmsData.revisions })
  }),

  http.post('/api/admin/cms/revisions', async ({ request }) => {
    const body = await request.json() as { version?: number }
    if (!body.version) {
      return HttpResponse.json({ error: 'Version is required' }, { status: 400 })
    }
    return HttpResponse.json({ success: true })
  }),

  // Admin Leads
  http.get('/api/admin/leads', ({ request }) => {
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase()
    const page = Number(url.searchParams.get('page')) || 1
    const source = url.searchParams.get('source')

    let filtered = [...mockLeadsData.leads]
    if (search) {
      filtered = filtered.filter(l =>
        l.name.toLowerCase().includes(search) || l.email.toLowerCase().includes(search)
      )
    }
    if (source) {
      filtered = filtered.filter(l => l.source === source)
    }

    return HttpResponse.json({
      leads: filtered,
      total: filtered.length,
      page,
      limit: 50,
      totalPages: Math.ceil(filtered.length / 50) || 1,
      stats: mockLeadsData.stats,
    })
  }),

  // Admin Settings
  http.get('/api/admin/settings', () => {
    return HttpResponse.json(mockSettingsData)
  }),

  http.put('/api/admin/settings', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ success: true, ...body })
  }),

  // Settings Test
  http.post('/api/admin/settings/test', async ({ request }) => {
    const body = await request.json() as { service: string; id: string }
    if (body.service === 'ga4' && body.id.startsWith('G-')) {
      return HttpResponse.json({ valid: true })
    }
    if (body.service === 'fb' && /^\d{10,20}$/.test(body.id)) {
      return HttpResponse.json({ valid: true })
    }
    if (body.service === 'gads' && body.id.startsWith('AW-')) {
      return HttpResponse.json({ valid: true })
    }
    return HttpResponse.json({ valid: false, error: 'ID inválido' }, { status: 400 })
  }),

  // Admin Images
  http.get('/api/admin/images', () => {
    return HttpResponse.json(mockImagesData)
  }),

  // Public Settings
  http.get('/api/settings', () => {
    return HttpResponse.json({
      ga4Id: 'G-XXXXXXXXXX',
      fbPixelId: '1234567890',
      gAdsId: 'AW-XXXXXXXXX',
      gAdsLabel: 'test_label',
    })
  }),

  // Health
  http.get('/api/health', () => {
    return HttpResponse.json({
      ok: true,
      env: true,
      db: true,
      cms: true,
      timestamp: new Date().toISOString(),
    })
  }),
]

export const errorHandlers = [
  http.get('/api/admin/analytics', () => {
    return HttpResponse.json({ error: 'Erro interno' }, { status: 500 })
  }),
  http.get('/api/admin/cms', () => {
    return HttpResponse.json({ error: 'Falha ao carregar CMS' }, { status: 500 })
  }),
  http.get('/api/admin/leads', () => {
    return HttpResponse.json({ error: 'Erro ao carregar leads' }, { status: 500 })
  }),
  http.get('/api/admin/settings', () => {
    return HttpResponse.json({ error: 'Erro ao carregar config' }, { status: 500 })
  }),
  http.put('/api/admin/settings', () => {
    return HttpResponse.json({ error: 'Erro ao salvar' }, { status: 500 })
  }),
]
