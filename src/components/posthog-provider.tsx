'use client'

// PostHog is initialized in instrumentation-client.ts (Next.js 15.3+).
// This component exists as a lightweight wrapper so analytics-providers.tsx
// keeps working without layout changes.
export function PosthogProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
