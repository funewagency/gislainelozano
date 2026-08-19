import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { verifyWebhookSignature } from './verify'

function captureSentryException(error: unknown) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Sentry = require('@sentry/nextjs')
    Sentry.captureException(error)
  } catch {
    // Sentry disabled or not available
  }
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-webhook-signature')
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    const rawBody = await request.text()
    const secret = process.env.WEBHOOK_SECRET || 'dev-webhook-secret'

    if (!verifyWebhookSignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(rawBody)
    console.log(`[Revalidate] Event: ${payload.event}, Tenant: ${payload.tenant}`)

    revalidatePath('/')
    console.log('[Revalidate] Path / revalidated')

    return NextResponse.json({
      success: true,
      message: 'Revalidation triggered',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Revalidate] Error:', error)
    captureSentryException(error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
