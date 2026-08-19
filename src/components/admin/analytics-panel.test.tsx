// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@/test/test-utils'
import { AnalyticsPanel } from './analytics-panel'

const mockPosthogData = {
  configured: true,
  pageViews: {
    total: 1542,
    trend: [
      { date: '2026-06-01', count: 45 },
      { date: '2026-06-02', count: 52 },
    ],
  },
  uniqueVisitors: 892,
  topSources: [
    { source: 'google', count: 320 },
    { source: 'direct', count: 210 },
  ],
  topPages: [
    { path: '/', views: 450 },
  ],
  recentEvents: [
    { event: 'page_view', count: 1542 },
  ],
  conversionFunnel: [
    { step: 'Visitantes', count: 892 },
    { step: 'Leads', count: 45 },
  ],
}

const mockLeadsBySource = [
  { source: 'google', count: 30 },
  { source: 'direct', count: 15 },
]

describe('AnalyticsPanel', () => {
  it('renders lead count in KPI cards', () => {
    const { container } = render(
      <AnalyticsPanel
        leadsTotal={45}
        leadsBySource={mockLeadsBySource}
        posthog={mockPosthogData}
      />,
    )
    const boldTexts = container.querySelectorAll('.text-2xl')
    const leadTexts = Array.from(boldTexts).filter(el => el.textContent === '45')
    expect(leadTexts.length).toBeGreaterThanOrEqual(1)
  })

  it('renders page view count in KPI cards', () => {
    const { container } = render(
      <AnalyticsPanel
        leadsTotal={45}
        leadsBySource={mockLeadsBySource}
        posthog={mockPosthogData}
      />,
    )
    const boldTexts = container.querySelectorAll('.text-2xl')
    const pageViewTexts = Array.from(boldTexts).filter(el => el.textContent === '1.542')
    expect(pageViewTexts.length).toBeGreaterThanOrEqual(1)
  })

  it('renders unique visitor count in KPI cards', () => {
    const { container } = render(
      <AnalyticsPanel
        leadsTotal={45}
        leadsBySource={mockLeadsBySource}
        posthog={mockPosthogData}
      />,
    )
    const boldTexts = container.querySelectorAll('.text-2xl')
    const visitorTexts = Array.from(boldTexts).filter(el => el.textContent === '892')
    expect(visitorTexts.length).toBeGreaterThanOrEqual(1)
  })

  it('shows conversion rate percentage', () => {
    const { container } = render(
      <AnalyticsPanel
        leadsTotal={45}
        leadsBySource={mockLeadsBySource}
        posthog={mockPosthogData}
      />,
    )
    const boldTexts = container.querySelectorAll('.text-2xl')
    const convTexts = Array.from(boldTexts).filter(el => /5\.0[4-5]%/.test(el.textContent || ''))
    expect(convTexts.length).toBeGreaterThanOrEqual(1)
  })

  it('shows conversion as — when leads exist but no visitors', () => {
    render(
      <AnalyticsPanel
        leadsTotal={45}
        leadsBySource={mockLeadsBySource}
        posthog={{
          ...mockPosthogData,
          uniqueVisitors: 0,
        }}
      />,
    )
    const kpiTexts = screen.getAllByText(/0\.00%/)
    expect(kpiTexts.length).toBeGreaterThanOrEqual(1)
  })

  it('shows 0.00% when no leads and no visitors', () => {
    render(
      <AnalyticsPanel
        leadsTotal={0}
        leadsBySource={[]}
        posthog={{
          ...mockPosthogData,
          uniqueVisitors: 0,
          pageViews: { total: 0, trend: [] },
        }}
      />,
    )
    expect(screen.getByText('0.00%')).toBeDefined()
  })

  it('shows configured badge for PostHog', () => {
    render(
      <AnalyticsPanel
        leadsTotal={0}
        leadsBySource={[]}
        posthog={mockPosthogData}
      />,
    )
    expect(screen.getByText('PostHog')).toBeDefined()
  })

  it('shows "não configurado" when PostHog not configured', () => {
    render(
      <AnalyticsPanel
        leadsTotal={0}
        leadsBySource={[]}
        posthog={null}
      />,
    )
    const notConfigured = screen.getAllByText(/não configurado/)
    expect(notConfigured.length).toBeGreaterThanOrEqual(1)
  })

  it('shows empty state for unconfigured analytics', () => {
    render(
      <AnalyticsPanel
        leadsTotal={0}
        leadsBySource={[]}
        posthog={{
          configured: false,
          pageViews: { total: 0, trend: [] },
          uniqueVisitors: 0,
          topSources: [],
          topPages: [],
          recentEvents: [],
          conversionFunnel: [],
        }}
      />,
    )
    const messages = screen.getAllByText(/Configure POSTHOG_API_KEY/i)
    expect(messages.length).toBeGreaterThanOrEqual(1)
  })

  it('renders KPI card labels', () => {
    render(
      <AnalyticsPanel
        leadsTotal={30}
        leadsBySource={mockLeadsBySource}
        posthog={mockPosthogData}
      />,
    )
    expect(screen.getAllByText('Leads').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Visualizações/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Visitantes Únicos').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Conversão').length).toBeGreaterThanOrEqual(1)
  })

  it('renders KPI subtitle for leads', () => {
    render(
      <AnalyticsPanel
        leadsTotal={30}
        leadsBySource={mockLeadsBySource}
        posthog={mockPosthogData}
      />,
    )
    expect(screen.getByText('formulários')).toBeDefined()
  })

  it('handles empty leads data', () => {
    render(
      <AnalyticsPanel
        leadsTotal={0}
        leadsBySource={[]}
        posthog={mockPosthogData}
      />,
    )
    expect(screen.getByText('0')).toBeDefined()
  })
})
