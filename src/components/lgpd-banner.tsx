'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { C, headingFont, bodyFont } from '@/components/gislaine/constants'
import posthog from 'posthog-js'
import { initThirdPartyAnalytics } from '@/lib/analytics-init'

export function LgpdBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [animationState, setAnimationState] = useState<'idle' | 'entering' | 'entered' | 'exiting'>('idle')

  // Check if consent has been given or banner should be shown
  useEffect(() => {
    const consent = localStorage.getItem('lgpd-consent')
    const hasDismissed = localStorage.getItem('lgpd-banner-dismissed')
    
    if (consent === 'true') {
      const configEl = document.getElementById('analytics-config')
      if (configEl?.textContent) {
        try {
          const config = JSON.parse(configEl.textContent)
          initThirdPartyAnalytics(config)
        } catch { /* config not available */ }
      }
    }

    if (!consent && !hasDismissed) {
      setAnimationState('entering')
      setIsVisible(true)
    }
  }, [])

  const acceptConsent = () => {
    setAnimationState('exiting')
    posthog.opt_in_capturing()
    posthog.capture('lgpd_consent_given', {})

    const configEl = document.getElementById('analytics-config')
    if (configEl?.textContent) {
      try {
        const config = JSON.parse(configEl.textContent)
        initThirdPartyAnalytics(config)
      } catch { /* config not available */ }
    }

    setTimeout(() => {
      localStorage.setItem('lgpd-consent', 'true')
      localStorage.setItem('lgpd-banner-dismissed', 'true')
      setIsVisible(false)
    }, 300)
  }

  const rejectConsent = () => {
    setAnimationState('exiting')
    
    setTimeout(() => {
      localStorage.setItem('lgpd-consent', 'false')
      localStorage.setItem('lgpd-banner-dismissed', 'true')
      setIsVisible(false)
    }, 300)
  }

  const closeBanner = () => {
    setAnimationState('exiting')
    
    setTimeout(() => {
      localStorage.setItem('lgpd-banner-dismissed', 'true')
      setIsVisible(false)
    }, 300)
  }

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        if (animationState === 'entering') {
          setAnimationState('entered')
        }
      }, 10)
      return () => clearTimeout(timer)
    }
  }, [isVisible, animationState])

  if (!isVisible) return null

  const animationClasses = {
    idle: '',
    entering: 'translate-y-20 opacity-0',
    entered: 'translate-y-0 opacity-100',
    exiting: 'translate-y-20 opacity-0',
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
        animationClasses[animationState]
      }`}
      style={{
        background: `linear-gradient(to top, ${C.primary} 0%, rgba(25, 57, 108, 0.95) 100%)`,
        borderTop: `1px solid ${C.accent}`,
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Consent text */}
          <div className="flex-1">
            <p className="text-sm leading-relaxed" style={{ color: C.white, fontFamily: bodyFont.fontFamily }}>
              Usamos cookies e tecnologias semelhantes para entender seu uso do site e melhorar sua experiência. 
              Ao clicar em <strong style={{ color: C.accent }}>Aceitar</strong>, você consente com o tratamento 
              de dados conforme nossa{' '}
              <a
                href="/privacy"
                className="underline"
                style={{ color: C.accent }}
                onClick={(e) => e.preventDefault()}
              >
                Política de Privacidade
              </a>.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={acceptConsent}
              className="px-6 py-2 text-sm font-semibold uppercase tracking-[0.15em] transition-all duration-200 hover:scale-105"
              style={{
                ...headingFont,
                backgroundColor: C.accent,
                color: C.white,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = C.white
                e.currentTarget.style.color = C.accent
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = C.accent
                e.currentTarget.style.color = C.white
              }}
            >
              Aceitar
            </button>
            
            <button
              onClick={rejectConsent}
              className="px-6 py-2 text-sm uppercase tracking-[0.15em]"
              style={{ ...bodyFont, color: 'rgba(255, 255, 255, 0.6)' }}
            >
              Recusar
            </button>
            
            <button
              onClick={closeBanner}
              className="p-1 hover:opacity-80 transition-opacity"
              style={{ color: 'rgba(255, 255, 255, 0.8)' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}