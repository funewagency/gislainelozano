const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN

if (dsn) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Sentry = require('@sentry/nextjs')
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      environment: process.env.NODE_ENV || 'development',
      beforeSend(event: Record<string, any>) {
        if (event.request?.data) {
          delete event.request.data
        }
        return event
      },
    })
  } catch (e) {
    console.warn('Sentry initialization skipped:', e)
  }
}

export {}
