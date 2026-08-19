import posthog from 'posthog-js'

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY

if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: '/ingest',
    ui_host: 'https://us.posthog.com',
    defaults: '2026-01-30',
    capture_exceptions: true,
    debug: process.env.NODE_ENV === 'development',
  })

  // LGPD compliance: opt out by default, restore consent from previous session
  posthog.opt_out_capturing()
  if (typeof localStorage !== 'undefined' && localStorage.getItem('lgpd-consent') === 'true') {
    posthog.opt_in_capturing()
  }
}
