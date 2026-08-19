'use client'

import { PosthogProvider } from '@/components/posthog-provider'
import { LgpdBanner } from '@/components/lgpd-banner'
import { useAnalyticsPageView } from '@/lib/analytics'
import { WhatsAppProvider } from '@/components/gislaine/whatsapp-context'

function PageViewTracker() {
  useAnalyticsPageView()
  return null
}

export function AnalyticsProviders({ children }: { children: React.ReactNode }) {
  return (
    <PosthogProvider>
      <WhatsAppProvider>
        <PageViewTracker />
        {children}
        <LgpdBanner />
      </WhatsAppProvider>
    </PosthogProvider>
  )
}